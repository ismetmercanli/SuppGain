using SuppGain.Domain.Common;
using SuppGain.Domain.Enums;

namespace SuppGain.Domain.Entities;

public class NotificationLog : BaseEntity
{
    public Guid ReminderId { get; set; }
    public NotificationReminder Reminder { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime ScheduledAtUtc { get; set; }
    public DateTime SentAtUtc { get; set; }
    public NotificationDeliveryStatus Status { get; set; } = NotificationDeliveryStatus.Sent;
    public string ErrorMessage { get; set; } = string.Empty;
}
