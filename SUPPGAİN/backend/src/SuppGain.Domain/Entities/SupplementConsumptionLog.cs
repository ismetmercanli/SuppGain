using SuppGain.Domain.Common;

namespace SuppGain.Domain.Entities;

public class SupplementConsumptionLog : BaseEntity
{
    public Guid TrackerId { get; set; }
    public SupplementTracker Tracker { get; set; } = null!;
    public decimal ConsumedAmount { get; set; }
    public DateTime ConsumedAtUtc { get; set; }
    public string Note { get; set; } = string.Empty;
}
