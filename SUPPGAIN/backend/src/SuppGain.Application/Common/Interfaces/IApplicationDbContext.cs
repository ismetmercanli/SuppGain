using Microsoft.EntityFrameworkCore;
using SuppGain.Domain.Entities;

namespace SuppGain.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Product> Products { get; }
    DbSet<Cart> Carts { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<WeeklyProgram> WeeklyPrograms { get; }
    DbSet<SupplementInfo> SupplementInfos { get; }
    DbSet<SupplementTracker> SupplementTrackers { get; }
    DbSet<SupplementConsumptionLog> SupplementConsumptionLogs { get; }
    DbSet<NotificationReminder> NotificationReminders { get; }
    DbSet<NotificationLog> NotificationLogs { get; }
    DbSet<AthletePackage> AthletePackages { get; }
    DbSet<AthletePackageItem> AthletePackageItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
