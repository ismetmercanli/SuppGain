using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Persistence.Configurations;

public class SupplementConsumptionLogConfiguration : IEntityTypeConfiguration<SupplementConsumptionLog>
{
    public void Configure(EntityTypeBuilder<SupplementConsumptionLog> builder)
    {
        builder.Property(x => x.ConsumedAmount).HasPrecision(12, 2);
        builder.Property(x => x.Note).HasMaxLength(300);

        builder.HasIndex(x => x.TrackerId);
        builder.HasIndex(x => x.ConsumedAtUtc);
    }
}
