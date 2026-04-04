using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.SupplementTracking.Models;

public sealed class ConsumeSupplementRequest
{
    [Range(0.01, 9999)]
    public decimal ConsumedAmount { get; init; }

    [MaxLength(300)]
    public string? Note { get; init; }
}
