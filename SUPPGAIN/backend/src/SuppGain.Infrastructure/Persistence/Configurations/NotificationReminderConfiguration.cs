using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Persistence.Configurations;

public class NotificationReminderConfiguration : IEntityTypeConfiguration<NotificationReminder>
{
    public void Configure(EntityTypeBuilder<NotificationReminder> builder)
    {
        builder.Property(x => x.Title).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Message).HasMaxLength(500).IsRequired();
        builder.Property(x => x.DaysOfWeekJson).HasMaxLength(100).IsRequired();

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.SupplementTrackerId);
        builder.HasIndex(x => x.IsEnabled);
        builder.HasIndex(x => new { x.UserId, x.NotifyAtTimeUtc });
    }
}
