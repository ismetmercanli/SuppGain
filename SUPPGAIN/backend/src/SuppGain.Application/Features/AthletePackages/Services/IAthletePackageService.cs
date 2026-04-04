using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.AthletePackages.Models;

namespace SuppGain.Application.Features.AthletePackages.Services;

public interface IAthletePackageService
{
    Task<IReadOnlyList<AthletePackageResponse>> GetListAsync(AthletePackageListQuery query, CancellationToken cancellationToken);
    Task<OperationResult<AthletePackageResponse>> GetByIdAsync(Guid packageId, CancellationToken cancellationToken);
    Task<OperationResult<AthletePackageResponse>> CreateAsync(CreateAthletePackageRequest request, CancellationToken cancellationToken);
    Task<OperationResult<AthletePackageResponse>> UpdateAsync(Guid packageId, UpdateAthletePackageRequest request, CancellationToken cancellationToken);
    Task<OperationResult<bool>> DeleteAsync(Guid packageId, CancellationToken cancellationToken);
}
