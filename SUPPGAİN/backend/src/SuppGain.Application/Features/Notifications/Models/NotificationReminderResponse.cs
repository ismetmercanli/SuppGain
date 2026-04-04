namespace SuppGain.Application.Features.Notifications.Models;

public sealed class NotificationReminderResponse
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public Guid? SupplementTrackerId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string NotifyAtTimeUtc { get; init; } = "00:00";
    public string DaysOfWeekJson { get; init; } = "[]";
    public string Channel { get; init; } = "InApp";
    public bool IsEnabled { get; init; }
    public DateTime? LastSentAtUtc { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public DateTime? UpdatedAtUtc { get; init; }
}
