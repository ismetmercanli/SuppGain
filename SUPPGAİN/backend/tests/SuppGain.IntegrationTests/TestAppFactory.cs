using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Domain.Entities;
using SuppGain.Domain.Enums;
using SuppGain.Infrastructure.Persistence;

namespace SuppGain.IntegrationTests;

public sealed class TestAppFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _connection.Open();

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "DataSource=:memory:",
                ["AdminSeed:Enabled"] = "false"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.RemoveAll(typeof(AppDbContext));
            services.RemoveAll(typeof(IApplicationDbContext));

            services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));
            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<AppDbContext>());

            using var scope = services.BuildServiceProvider().CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            dbContext.Database.EnsureCreated();
        });
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        await dbContext.Database.EnsureCreatedAsync();
        await dbContext.NotificationLogs.ExecuteDeleteAsync();
        await dbContext.NotificationReminders.ExecuteDeleteAsync();
        await dbContext.SupplementConsumptionLogs.ExecuteDeleteAsync();
        await dbContext.AthletePackageItems.ExecuteDeleteAsync();
        await dbContext.AthletePackages.ExecuteDeleteAsync();
        await dbContext.OrderItems.ExecuteDeleteAsync();
        await dbContext.Orders.ExecuteDeleteAsync();
        await dbContext.CartItems.ExecuteDeleteAsync();
        await dbContext.Carts.ExecuteDeleteAsync();
        await dbContext.SupplementTrackers.ExecuteDeleteAsync();
        await dbContext.SupplementInfos.ExecuteDeleteAsync();
        await dbContext.WeeklyPrograms.ExecuteDeleteAsync();
        await dbContext.Products.ExecuteDeleteAsync();
        await dbContext.Users.ExecuteDeleteAsync();

        dbContext.Users.Add(new User
        {
            FirstName = "System",
            LastName = "Admin",
            Email = "admin@suppgain.local",
            PasswordHash = passwordHasher.Hash("Admin123!"),
            Role = UserRole.Admin,
            IsActive = true
        });

        await dbContext.SaveChangesAsync();
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _connection.Dispose();
        }
    }
}
