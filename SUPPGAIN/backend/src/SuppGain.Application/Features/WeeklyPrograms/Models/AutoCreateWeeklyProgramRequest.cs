using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.WeeklyPrograms.Models;

public sealed class AutoCreateWeeklyProgramRequest
{
    [MaxLength(150)]
    public string? Title { get; init; }

    public IReadOnlyList<Guid>? SelectedProductIds { get; init; }
}
