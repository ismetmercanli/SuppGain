namespace SuppGain.Application.Features.WeeklyPrograms.Models;

public sealed class WeeklyProgramResponse
{
    public Guid ProgramId { get; init; }
    public Guid UserId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string ContentJson { get; init; } = "{}";
    public DateTime CreatedAtUtc { get; init; }
    public DateTime? UpdatedAtUtc { get; init; }
}
