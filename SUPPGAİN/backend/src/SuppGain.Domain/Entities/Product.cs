using SuppGain.Domain.Common;

namespace SuppGain.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<SupplementTracker> SupplementTrackers { get; set; } = new List<SupplementTracker>();
    public ICollection<AthletePackageItem> AthletePackageItems { get; set; } = new List<AthletePackageItem>();
}
