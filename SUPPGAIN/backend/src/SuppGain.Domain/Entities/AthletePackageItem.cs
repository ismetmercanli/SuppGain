using SuppGain.Domain.Common;

namespace SuppGain.Domain.Entities;

public class AthletePackageItem : BaseEntity
{
    public Guid AthletePackageId { get; set; }
    public AthletePackage AthletePackage { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }
}
