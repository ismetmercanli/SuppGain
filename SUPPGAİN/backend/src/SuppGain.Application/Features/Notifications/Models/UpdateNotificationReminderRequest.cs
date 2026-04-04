using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.Notifications.Models;

public sealed class UpdateNotificationReminderRequest
{
    [Required]
    [MaxLength(120)]
    public string Title { get; init; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Message { get; init; } = string.Empty;

    [Required]
    [MaxLength(8)]
    public string NotifyAtTimeUtc { get; init; } = "08:00";

    [MaxLength(100)]
    public string DaysOfWeekJson { get; init; } = "[]";

    [Required]
    [MaxLength(20)]
    public string Channel { get; init; } = "InApp";

    public bool IsEnabled { get; init; } = true;
}
