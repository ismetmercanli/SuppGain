using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Persistence.Configurations;

public class WeeklyProgramConfiguration : IEntityTypeConfiguration<WeeklyProgram>
{
    public void Configure(EntityTypeBuilder<WeeklyProgram> builder)
    {
        builder.Property(x => x.Title).HasMaxLength(150).IsRequired();
        builder.Property(x => x.ContentJson).IsRequired();

        builder.HasIndex(x => x.UserId);
    }
}
