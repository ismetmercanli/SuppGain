using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace SuppGain.IntegrationTests;

public sealed class ApiIntegrationTests : IClassFixture<TestAppFactory>
{
    private readonly TestAppFactory _factory;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public ApiIntegrationTests(TestAppFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Auth_Register_And_Login_ShouldReturnToken()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();
        var email = $"user_{Guid.NewGuid():N}@test.com";

        var registerResponse = await client.PostAsJsonAsync("/auth/register", new
        {
            firstName = "Test",
            lastName = "User",
            email,
            password = "Password123!",
            phone = "5550000000"
        });

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);

        var loginResponse = await client.PostAsJsonAsync("/auth/login", new
        {
            email,
            password = "Password123!"
        });

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        var payload = await loginResponse.Content.ReadFromJsonAsync<AuthPayload>(_jsonOptions);
        Assert.False(string.IsNullOrWhiteSpace(payload?.Token));
    }

    [Fact]
    public async Task Products_Create_ShouldRequireAdmin()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();
        var userToken = await RegisterAndLoginAsync(client, $"user_{Guid.NewGuid():N}@test.com", "Password123!");

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);
        var response = await client.PostAsJsonAsync("/products", new
        {
            name = $"P_{Guid.NewGuid():N}",
            description = "Test product",
            price = 50,
            stock = 10,
            category = "Supplement",
            isActive = true
        });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Cart_To_Order_Flow_ShouldDecreaseStock()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var adminToken = await LoginAdminAsync(client);
        var productId = await CreateProductAsAdminAsync(client, adminToken, 20, 15m);

        var userToken = await RegisterAndLoginAsync(client, $"buyer_{Guid.NewGuid():N}@test.com", "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

        var addCartResponse = await client.PostAsJsonAsync("/cart", new { productId, quantity = 3 });
        Assert.Equal(HttpStatusCode.OK, addCartResponse.StatusCode);

        var createOrderResponse = await client.PostAsync("/orders", null);
        Assert.Equal(HttpStatusCode.Created, createOrderResponse.StatusCode);

        var productResponse = await client.GetAsync($"/products/{productId}");
        Assert.Equal(HttpStatusCode.OK, productResponse.StatusCode);
        var product = await productResponse.Content.ReadFromJsonAsync<ProductPayload>(_jsonOptions);
        Assert.Equal(17, product!.Stock);
    }

    [Fact]
    public async Task Notifications_Create_SendNow_And_Logs_ShouldWork()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();
        var userToken = await RegisterAndLoginAsync(client, $"notify_{Guid.NewGuid():N}@test.com", "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

        var createReminder = await client.PostAsJsonAsync("/notifications/reminders", new
        {
            supplementTrackerId = (Guid?)null,
            title = "Take supplement",
            message = "Time to take supplement",
            notifyAtTimeUtc = "20:00",
            daysOfWeekJson = "[1,2,3,4,5]",
            channel = "InApp"
        });

        Assert.Equal(HttpStatusCode.Created, createReminder.StatusCode);
        var reminder = await createReminder.Content.ReadFromJsonAsync<IdPayload>(_jsonOptions);
        Assert.NotNull(reminder);

        var sendNow = await client.PostAsync($"/notifications/reminders/{reminder!.Id}/send-now", null);
        Assert.Equal(HttpStatusCode.OK, sendNow.StatusCode);

        var logs = await client.GetAsync($"/notifications/logs/me?reminderId={reminder.Id}");
        Assert.Equal(HttpStatusCode.OK, logs.StatusCode);
        var list = await logs.Content.ReadFromJsonAsync<List<NotificationLogPayload>>(_jsonOptions);
        Assert.NotNull(list);
        Assert.NotEmpty(list!);
    }

    [Fact]
    public async Task AthletePackages_Create_Update_Delete_ShouldWork()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();
        var adminToken = await LoginAdminAsync(client);

        var product1 = await CreateProductAsAdminAsync(client, adminToken, 100, 120m);
        var product2 = await CreateProductAsAdminAsync(client, adminToken, 100, 80m);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        var createPackage = await client.PostAsJsonAsync("/packages", new
        {
            name = $"Runner Package {Guid.NewGuid():N}",
            description = "Runner starter package",
            athleteType = "Runner",
            discountPercentage = 10,
            isActive = true,
            items = new[]
            {
                new { productId = product1, quantity = 1 },
                new { productId = product2, quantity = 2 }
            }
        });

        Assert.Equal(HttpStatusCode.Created, createPackage.StatusCode);
        var created = await createPackage.Content.ReadFromJsonAsync<AthletePackagePayload>(_jsonOptions);
        Assert.NotNull(created);
        Assert.Equal(280m, created!.BaseTotalPrice);
        Assert.Equal(252m, created.FinalPrice);

        var updatePackage = await client.PutAsJsonAsync($"/packages/{created.Id}", new
        {
            name = created.Name,
            description = "Runner package updated",
            athleteType = "Runner",
            discountPercentage = 15,
            isActive = true,
            items = new[]
            {
                new { productId = product1, quantity = 2 },
                new { productId = product2, quantity = 1 }
            }
        });

        Assert.Equal(HttpStatusCode.OK, updatePackage.StatusCode);
        var updated = await updatePackage.Content.ReadFromJsonAsync<AthletePackagePayload>(_jsonOptions);
        Assert.NotNull(updated);
        Assert.Equal(272m, updated!.FinalPrice);

        var deletePackage = await client.DeleteAsync($"/packages/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deletePackage.StatusCode);
    }

    [Fact]
    public async Task Users_Me_Get_And_Delete_ShouldWork()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();
        var email = $"profile_{Guid.NewGuid():N}@test.com";
        var password = "Password123!";
        var token = await RegisterAndLoginAsync(client, email, password);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var meResponse = await client.GetAsync("/users/me");
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        var me = await meResponse.Content.ReadFromJsonAsync<UserPayload>(_jsonOptions);
        Assert.NotNull(me);
        Assert.Equal(email, me!.Email);

        var deleteResponse = await client.DeleteAsync("/users/me");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        client.DefaultRequestHeaders.Authorization = null;
        var loginAfterDelete = await client.PostAsJsonAsync("/auth/login", new { email, password });
        Assert.Equal(HttpStatusCode.Unauthorized, loginAfterDelete.StatusCode);
    }

    [Fact]
    public async Task Users_Me_Update_ShouldWork()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();
        var email = $"profile_update_{Guid.NewGuid():N}@test.com";
        var token = await RegisterAndLoginAsync(client, email, "Password123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var updateResponse = await client.PutAsJsonAsync("/users/me", new
        {
            firstName = "Guncel",
            lastName = "Kullanici",
            email = $"updated_{Guid.NewGuid():N}@test.com",
            phone = "5559990000",
            age = 29,
            gender = "Erkek",
            heightCm = 181.5m,
            weightKg = 78.2m
        });

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = await updateResponse.Content.ReadFromJsonAsync<UserPayload>(_jsonOptions);
        Assert.NotNull(updated);
        Assert.Equal("Guncel", updated!.FirstName);
        Assert.Equal("Kullanici", updated.LastName);
        Assert.Equal("5559990000", updated.Phone);
        Assert.Equal(29, updated.Age);
        Assert.Equal("Erkek", updated.Gender);
        Assert.Equal(181.5m, updated.HeightCm);
        Assert.Equal(78.2m, updated.WeightKg);
    }

    private static async Task<string> LoginAdminAsync(HttpClient client)
    {
        var loginResponse = await client.PostAsJsonAsync("/auth/login", new
        {
            email = "admin@suppgain.local",
            password = "Admin123!"
        });

        loginResponse.EnsureSuccessStatusCode();
        var payload = await loginResponse.Content.ReadFromJsonAsync<AuthPayload>();
        return payload!.Token;
    }

    private static async Task<string> RegisterAndLoginAsync(HttpClient client, string email, string password)
    {
        var registerResponse = await client.PostAsJsonAsync("/auth/register", new
        {
            firstName = "Test",
            lastName = "User",
            email,
            password,
            phone = "5550000000"
        });

        registerResponse.EnsureSuccessStatusCode();

        var loginResponse = await client.PostAsJsonAsync("/auth/login", new { email, password });
        loginResponse.EnsureSuccessStatusCode();
        var payload = await loginResponse.Content.ReadFromJsonAsync<AuthPayload>();
        return payload!.Token;
    }

    private static async Task<Guid> CreateProductAsAdminAsync(HttpClient client, string adminToken, int stock, decimal price)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var response = await client.PostAsJsonAsync("/products", new
        {
            name = $"P_{Guid.NewGuid():N}",
            description = "Test product",
            price,
            stock,
            category = "Supplement",
            isActive = true
        });

        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<IdPayload>();
        return payload!.Id;
    }

    private sealed record AuthPayload(string Token);
    private sealed record IdPayload(Guid Id);
    private sealed record ProductPayload(Guid Id, int Stock);
    private sealed record NotificationLogPayload(Guid Id, Guid ReminderId, string Status);
    private sealed record AthletePackagePayload(Guid Id, string Name, decimal BaseTotalPrice, decimal FinalPrice);
    private sealed record UserPayload(
        Guid Id,
        string Email,
        string FirstName,
        string LastName,
        string Role,
        bool IsActive,
        string? Phone,
        int? Age,
        string? Gender,
        decimal? HeightCm,
        decimal? WeightKg);
}
