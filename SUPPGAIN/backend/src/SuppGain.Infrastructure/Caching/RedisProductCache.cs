using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Application.Features.Products.Models;

namespace SuppGain.Infrastructure.Caching;

public sealed class RedisProductCache : IProductCache
{
    private const string ProductListKeyPrefix = "suppgain:products:list";

    private readonly RedisOptions _options;
    private readonly ILogger<RedisProductCache> _logger;

    public RedisProductCache(
        IOptions<RedisOptions> options,
        ILogger<RedisProductCache> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<IReadOnlyList<ProductResponse>?> GetProductsAsync(
        ProductListQuery query,
        CancellationToken cancellationToken)
    {
        if (!_options.Enabled)
        {
            return null;
        }

        try
        {
            var database = await GetDatabaseAsync();
            var value = await database.StringGetAsync(BuildListKey(query));

            return value.HasValue
                ? JsonSerializer.Deserialize<IReadOnlyList<ProductResponse>>(value!)
                : null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis product list cache read failed.");
            return null;
        }
    }

    public async Task SetProductsAsync(
        ProductListQuery query,
        IReadOnlyList<ProductResponse> products,
        CancellationToken cancellationToken)
    {
        if (!_options.Enabled)
        {
            return;
        }

        try
        {
            var database = await GetDatabaseAsync();
            var payload = JsonSerializer.Serialize(products);
            await database.StringSetAsync(
                BuildListKey(query),
                payload,
                TimeSpan.FromSeconds(_options.ProductListTtlSeconds));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis product list cache write failed.");
        }
    }

    public async Task InvalidateProductsAsync(CancellationToken cancellationToken)
    {
        if (!_options.Enabled)
        {
            return;
        }

        try
        {
            var connection = await ConnectionMultiplexer.ConnectAsync(_options.ConnectionString);
            var database = connection.GetDatabase();

            foreach (var endpoint in connection.GetEndPoints())
            {
                var server = connection.GetServer(endpoint);
                var keys = server.Keys(pattern: $"{ProductListKeyPrefix}:*").ToArray();

                if (keys.Length > 0)
                {
                    await database.KeyDeleteAsync(keys);
                }
            }

            await connection.CloseAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis product list cache invalidation failed.");
        }
    }

    private async Task<IDatabase> GetDatabaseAsync()
    {
        var connection = await ConnectionMultiplexer.ConnectAsync(_options.ConnectionString);
        return connection.GetDatabase();
    }

    private static string BuildListKey(ProductListQuery query)
    {
        return string.Join(
            ":",
            ProductListKeyPrefix,
            query.Name?.Trim().ToLowerInvariant() ?? "any",
            query.Category?.Trim().ToLowerInvariant() ?? "any",
            query.MinPrice?.ToString() ?? "any",
            query.MaxPrice?.ToString() ?? "any",
            query.IsActive?.ToString().ToLowerInvariant() ?? "any");
    }
}
