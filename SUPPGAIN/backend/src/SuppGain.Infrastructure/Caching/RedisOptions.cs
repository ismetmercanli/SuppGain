namespace SuppGain.Infrastructure.Caching;

public sealed class RedisOptions
{
    public const string SectionName = "Redis";

    public bool Enabled { get; init; } = true;
    public string ConnectionString { get; init; } = "localhost:6379";
    public int ProductListTtlSeconds { get; init; } = 300;
}
