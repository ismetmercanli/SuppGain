using SuppGain.Domain.Common;
using SuppGain.Domain.Enums;

namespace SuppGain.Domain.Entities;

public class NotificationReminder : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? SupplementTrackerId { get; set; }
    public SupplementTracker? SupplementTracker { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public TimeSpan NotifyAtTimeUtc { get; set; }
    public string DaysOfWeekJson { get; set; } = "[]";
    public NotificationChannel Channel { get; set; } = NotificationChannel.InApp;
    public bool IsEnabled { get; set; } = true;
    public DateTime? LastSentAtUtc { get; set; }

    public ICollection<NotificationLog> Logs { get; set; } = new List<NotificationLog>();
}
