using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.AthletePackages.Models;

public sealed class AthletePackageItemRequest
{
    [Required]
    public Guid ProductId { get; init; }

    [Range(1, 999)]
    public int Quantity { get; init; }
}
