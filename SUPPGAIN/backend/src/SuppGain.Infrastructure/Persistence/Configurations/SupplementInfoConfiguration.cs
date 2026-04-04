using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Persistence.Configurations;

public class SupplementInfoConfiguration : IEntityTypeConfiguration<SupplementInfo>
{
    public void Configure(EntityTypeBuilder<SupplementInfo> builder)
    {
        builder.Property(x => x.Title).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Summary).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Content).HasMaxLength(8000).IsRequired();
        builder.Property(x => x.Benefits).HasMaxLength(3000);
        builder.Property(x => x.UsageInstructions).HasMaxLength(3000);
        builder.Property(x => x.Warnings).HasMaxLength(3000);
        builder.Property(x => x.SideEffects).HasMaxLength(3000);
        builder.Property(x => x.TargetAudience).HasMaxLength(100);
        builder.Property(x => x.References).HasMaxLength(2000);

        builder.HasIndex(x => x.Title).IsUnique();
        builder.HasIndex(x => x.IsPublished);
        builder.HasIndex(x => x.TargetAudience);
    }
}
