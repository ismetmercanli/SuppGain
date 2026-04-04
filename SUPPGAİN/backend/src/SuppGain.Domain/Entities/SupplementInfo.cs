using SuppGain.Domain.Common;

namespace SuppGain.Domain.Entities;

public class SupplementInfo : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Benefits { get; set; } = string.Empty;
    public string UsageInstructions { get; set; } = string.Empty;
    public string Warnings { get; set; } = string.Empty;
    public string SideEffects { get; set; } = string.Empty;
    public string TargetAudience { get; set; } = string.Empty;
    public string References { get; set; } = string.Empty;
    public bool IsPublished { get; set; } = true;
}
