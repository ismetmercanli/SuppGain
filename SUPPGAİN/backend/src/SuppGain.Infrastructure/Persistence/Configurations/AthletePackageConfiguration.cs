using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Persistence.Configurations;

public class AthletePackageConfiguration : IEntityTypeConfiguration<AthletePackage>
{
    public void Configure(EntityTypeBuilder<AthletePackage> builder)
    {
        builder.Property(x => x.Name).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.DiscountPercentage).HasPrecision(5, 2);

        builder.HasIndex(x => new { x.Name, x.AthleteType }).IsUnique();
        builder.HasIndex(x => x.AthleteType);
        builder.HasIndex(x => x.IsActive);
    }
}
