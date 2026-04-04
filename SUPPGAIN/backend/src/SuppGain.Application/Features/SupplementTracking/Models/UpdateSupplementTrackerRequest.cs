using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.SupplementTracking.Models;

public sealed class UpdateSupplementTrackerRequest
{
    [Range(0.01, 9999)]
    public decimal DailyDosage { get; init; }

    [Range(1, 12)]
    public int TimesPerDay { get; init; }

    [Required]
    [MaxLength(2000)]
    public string TimesOfDayJson { get; init; } = "[]";

    [Range(0, 999999)]
    public decimal CurrentStock { get; init; }

    [Range(0, 999999)]
    public decimal LowStockThreshold { get; init; }

    public DateTime StartDateUtc { get; init; }
    public DateTime? EndDateUtc { get; init; }
    public bool IsActive { get; init; } = true;
}
