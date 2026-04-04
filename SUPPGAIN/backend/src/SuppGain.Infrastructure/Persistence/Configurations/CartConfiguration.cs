using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Persistence.Configurations;

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.IsCheckedOut);
        builder.HasIndex(x => new { x.UserId, x.IsCheckedOut })
            .HasFilter("\"IsCheckedOut\" = false")
            .IsUnique();
    }
}
