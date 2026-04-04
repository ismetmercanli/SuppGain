using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.SupplementInfos.Models;

namespace SuppGain.Application.Features.SupplementInfos.Services;

public interface ISupplementInfoService
{
    Task<IReadOnlyList<SupplementInfoResponse>> GetListAsync(
        SupplementInfoListQuery query,
        bool isAdmin,
        CancellationToken cancellationToken);

    Task<OperationResult<SupplementInfoResponse>> GetByIdAsync(
        Guid id,
        bool isAdmin,
        CancellationToken cancellationToken);

    Task<OperationResult<SupplementInfoResponse>> CreateAsync(
        CreateSupplementInfoRequest request,
        CancellationToken cancellationToken);

    Task<OperationResult<SupplementInfoResponse>> UpdateAsync(
        Guid id,
        UpdateSupplementInfoRequest request,
        CancellationToken cancellationToken);

    Task<OperationResult<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
