using Microsoft.EntityFrameworkCore;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Persistence;

public class AppDbContext : DbContext, IApplicationDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<WeeklyProgram> WeeklyPrograms => Set<WeeklyProgram>();
    public DbSet<SupplementInfo> SupplementInfos => Set<SupplementInfo>();
    public DbSet<SupplementTracker> SupplementTrackers => Set<SupplementTracker>();
    public DbSet<SupplementConsumptionLog> SupplementConsumptionLogs => Set<SupplementConsumptionLog>();
    public DbSet<NotificationReminder> NotificationReminders => Set<NotificationReminder>();
    public DbSet<NotificationLog> NotificationLogs => Set<NotificationLog>();
    public DbSet<AthletePackage> AthletePackages => Set<AthletePackage>();
    public DbSet<AthletePackageItem> AthletePackageItems => Set<AthletePackageItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
