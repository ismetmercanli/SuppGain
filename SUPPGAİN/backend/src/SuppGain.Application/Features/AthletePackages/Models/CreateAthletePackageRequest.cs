using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.AthletePackages.Models;

public sealed class CreateAthletePackageRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; init; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string AthleteType { get; init; } = string.Empty;

    [Range(0, 100)]
    public decimal DiscountPercentage { get; init; }

    public bool IsActive { get; init; } = true;

    [Required]
    public List<AthletePackageItemRequest> Items { get; init; } = new();
}
