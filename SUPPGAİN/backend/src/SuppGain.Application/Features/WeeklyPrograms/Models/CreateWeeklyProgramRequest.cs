using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.WeeklyPrograms.Models;

public sealed class CreateWeeklyProgramRequest
{
    [Required]
    [MaxLength(150)]
    public string Title { get; init; } = string.Empty;

    [Required]
    public string ContentJson { get; init; } = "{}";
}
