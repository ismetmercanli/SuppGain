using SuppGain.Domain.Common;

namespace SuppGain.Domain.Entities;

public class Cart : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public bool IsCheckedOut { get; set; }

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
