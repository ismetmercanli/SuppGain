using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(x => x.FirstName).HasMaxLength(50).IsRequired();
        builder.Property(x => x.LastName).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(20);
        builder.Property(x => x.Gender).HasMaxLength(20);
        builder.Property(x => x.HeightCm).HasPrecision(5, 2);
        builder.Property(x => x.WeightKg).HasPrecision(5, 2);
        builder.Property(x => x.PasswordResetTokenHash).HasMaxLength(128);

        builder.HasIndex(x => x.Email).IsUnique();
    }
}
