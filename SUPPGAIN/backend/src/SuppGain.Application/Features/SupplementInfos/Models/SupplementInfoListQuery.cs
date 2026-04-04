namespace SuppGain.Application.Features.SupplementInfos.Models;

public sealed class SupplementInfoListQuery
{
    public string? Keyword { get; init; }
    public string? TargetAudience { get; init; }
    public bool? IsPublished { get; init; }
}
