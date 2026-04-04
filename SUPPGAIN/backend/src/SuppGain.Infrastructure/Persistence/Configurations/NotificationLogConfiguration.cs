using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Persistence.Configurations;

public class NotificationLogConfiguration : IEntityTypeConfiguration<NotificationLog>
{
    public void Configure(EntityTypeBuilder<NotificationLog> builder)
    {
        builder.Property(x => x.ErrorMessage).HasMaxLength(500).IsRequired();

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.ReminderId);
        builder.HasIndex(x => x.SentAtUtc);
        builder.HasIndex(x => x.Status);
    }
}
