using SuppGain.Domain.Common;

namespace SuppGain.Domain.Entities;

public class SupplementTracker : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public decimal DailyDosage { get; set; }
    public int TimesPerDay { get; set; }
    public string TimesOfDayJson { get; set; } = "[]";
    public decimal CurrentStock { get; set; }
    public decimal LowStockThreshold { get; set; }
    public DateTime StartDateUtc { get; set; }
    public DateTime? EndDateUtc { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastConsumedAtUtc { get; set; }

    public ICollection<SupplementConsumptionLog> ConsumptionLogs { get; set; } = new List<SupplementConsumptionLog>();
    public ICollection<NotificationReminder> NotificationReminders { get; set; } = new List<NotificationReminder>();
}
