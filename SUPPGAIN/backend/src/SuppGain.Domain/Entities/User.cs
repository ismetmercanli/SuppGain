using SuppGain.Domain.Common;
using SuppGain.Domain.Enums;

namespace SuppGain.Domain.Entities;

public class User : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PasswordResetTokenHash { get; set; }
    public DateTime? PasswordResetExpiresUtc { get; set; }
    public string? Phone { get; set; }
    public int? Age { get; set; }
    public string? Gender { get; set; }
    public decimal? HeightCm { get; set; }
    public decimal? WeightKg { get; set; }
    public bool IsActive { get; set; } = true;
    public UserRole Role { get; set; } = UserRole.User;

    public ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<WeeklyProgram> WeeklyPrograms { get; set; } = new List<WeeklyProgram>();
    public ICollection<SupplementTracker> SupplementTrackers { get; set; } = new List<SupplementTracker>();
    public ICollection<NotificationReminder> NotificationReminders { get; set; } = new List<NotificationReminder>();
    public ICollection<NotificationLog> NotificationLogs { get; set; } = new List<NotificationLog>();
}
