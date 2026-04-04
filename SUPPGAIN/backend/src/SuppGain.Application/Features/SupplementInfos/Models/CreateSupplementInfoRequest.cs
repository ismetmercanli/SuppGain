using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.SupplementInfos.Models;

public sealed class CreateSupplementInfoRequest
{
    [Required]
    [MaxLength(150)]
    public string Title { get; init; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Summary { get; init; } = string.Empty;

    [Required]
    [MaxLength(8000)]
    public string Content { get; init; } = string.Empty;

    [MaxLength(3000)]
    public string Benefits { get; init; } = string.Empty;

    [MaxLength(3000)]
    public string UsageInstructions { get; init; } = string.Empty;

    [MaxLength(3000)]
    public string Warnings { get; init; } = string.Empty;

    [MaxLength(3000)]
    public string SideEffects { get; init; } = string.Empty;

    [MaxLength(100)]
    public string TargetAudience { get; init; } = string.Empty;

    [MaxLength(2000)]
    public string References { get; init; } = string.Empty;

    public bool IsPublished { get; init; } = true;
}
