using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Persistence.Configurations;

public class SupplementTrackerConfiguration : IEntityTypeConfiguration<SupplementTracker>
{
    public void Configure(EntityTypeBuilder<SupplementTracker> builder)
    {
        builder.Property(x => x.DailyDosage).HasPrecision(12, 2);
        builder.Property(x => x.CurrentStock).HasPrecision(12, 2);
        builder.Property(x => x.LowStockThreshold).HasPrecision(12, 2);
        builder.Property(x => x.TimesOfDayJson).HasMaxLength(2000).IsRequired();

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.IsActive);
    }
}
