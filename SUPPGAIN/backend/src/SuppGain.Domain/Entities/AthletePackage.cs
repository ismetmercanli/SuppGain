using SuppGain.Domain.Common;
using SuppGain.Domain.Enums;

namespace SuppGain.Domain.Entities;

public class AthletePackage : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AthleteType AthleteType { get; set; }
    public decimal DiscountPercentage { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<AthletePackageItem> Items { get; set; } = new List<AthletePackageItem>();
}
