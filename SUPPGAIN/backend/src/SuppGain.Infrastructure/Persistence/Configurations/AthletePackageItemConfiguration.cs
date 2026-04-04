using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Persistence.Configurations;

public class AthletePackageItemConfiguration : IEntityTypeConfiguration<AthletePackageItem>
{
    public void Configure(EntityTypeBuilder<AthletePackageItem> builder)
    {
        builder.HasIndex(x => x.AthletePackageId);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => new { x.AthletePackageId, x.ProductId }).IsUnique();
    }
}
