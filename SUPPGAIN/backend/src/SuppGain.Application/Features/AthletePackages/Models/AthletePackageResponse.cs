namespace SuppGain.Application.Features.AthletePackages.Models;

public sealed class AthletePackageResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string AthleteType { get; init; } = string.Empty;
    public decimal DiscountPercentage { get; init; }
    public bool IsActive { get; init; }
    public decimal BaseTotalPrice { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal FinalPrice { get; init; }
    public IReadOnlyList<AthletePackageItemResponse> Items { get; init; } = Array.Empty<AthletePackageItemResponse>();
}
