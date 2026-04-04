namespace SuppGain.Application.Features.SupplementTracking.Models;

public sealed class StockStatusResponse
{
    public Guid TrackerId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public decimal CurrentStock { get; init; }
    public decimal LowStockThreshold { get; init; }
    public bool IsLowStock { get; init; }
    public decimal DailyConsumption { get; init; }
    public decimal? DaysRemaining { get; init; }
    public DateTime? EstimatedOutOfStockUtc { get; init; }
    public DateTime? LastConsumedAtUtc { get; init; }
}
