namespace SuppGain.Application.Features.AthletePackages.Models;

public sealed class AthletePackageListQuery
{
    public string? AthleteType { get; init; }
    public bool? IsActive { get; init; }
}
