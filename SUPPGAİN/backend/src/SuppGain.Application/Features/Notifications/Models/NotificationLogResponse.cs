namespace SuppGain.Application.Features.Notifications.Models;

public sealed class NotificationLogResponse
{
    public Guid Id { get; init; }
    public Guid ReminderId { get; init; }
    public Guid UserId { get; init; }
    public DateTime ScheduledAtUtc { get; init; }
    public DateTime SentAtUtc { get; init; }
    public string Status { get; init; } = "Sent";
    public string ErrorMessage { get; init; } = string.Empty;
}
