namespace SuppGain.Application.Features.SupplementTracking.Models;

public sealed class SupplementTrackerResponse
{
    public Guid TrackerId { get; init; }
    public Guid UserId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public decimal DailyDosage { get; init; }
    public int TimesPerDay { get; init; }
    public string TimesOfDayJson { get; init; } = "[]";
    public decimal CurrentStock { get; init; }
    public decimal LowStockThreshold { get; init; }
    public DateTime StartDateUtc { get; init; }
    public DateTime? EndDateUtc { get; init; }
    public bool IsActive { get; init; }
    public DateTime? LastConsumedAtUtc { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public DateTime? UpdatedAtUtc { get; init; }
}
