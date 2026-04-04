namespace SuppGain.Application.Features.SupplementTracking.Models;

public sealed class SupplementDashboardResponse
{
    public string LocalDate { get; init; } = string.Empty;
    public int TotalScheduledDoses { get; init; }
    public int CompletedDoses { get; init; }
    public int CompliancePercent { get; init; }
    public string? LastCompletedProductName { get; init; }
    public DateTime? LastCompletedAtUtc { get; init; }
    public IReadOnlyList<DashboardIntakeRowResponse> Intakes { get; init; } = Array.Empty<DashboardIntakeRowResponse>();
    public IReadOnlyList<DashboardStockAlertResponse> StockAlerts { get; init; } = Array.Empty<DashboardStockAlertResponse>();
}

public sealed class DashboardIntakeRowResponse
{
    public string RowId { get; init; } = string.Empty;
    public Guid TrackerId { get; init; }
    public int SlotIndex { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string PlannedTimeLocal { get; init; } = string.Empty;
    public string ContextHint { get; init; } = string.Empty;
    public decimal DoseAmount { get; init; }
    public bool IsCompleted { get; init; }
    public DateTime? LoggedAtUtc { get; init; }
    /// <summary>completed | due | upcoming</summary>
    public string Status { get; init; } = string.Empty;
}

public sealed class DashboardStockAlertResponse
{
    public Guid TrackerId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public decimal CurrentStock { get; init; }
    public decimal LowStockThreshold { get; init; }
    /// <summary>urgent — at/below threshold; warning — low but above threshold (within 2x)</summary>
    public string Severity { get; init; } = string.Empty;
}
