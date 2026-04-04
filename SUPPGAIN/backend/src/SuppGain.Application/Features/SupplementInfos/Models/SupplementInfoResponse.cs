namespace SuppGain.Application.Features.SupplementInfos.Models;

public sealed class SupplementInfoResponse
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Summary { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public string Benefits { get; init; } = string.Empty;
    public string UsageInstructions { get; init; } = string.Empty;
    public string Warnings { get; init; } = string.Empty;
    public string SideEffects { get; init; } = string.Empty;
    public string TargetAudience { get; init; } = string.Empty;
    public string References { get; init; } = string.Empty;
    public bool IsPublished { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public DateTime? UpdatedAtUtc { get; init; }
}
