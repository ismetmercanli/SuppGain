using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.SupplementTracking.Models;

namespace SuppGain.Application.Features.SupplementTracking.Services;

public interface ISupplementTrackingService
{
    Task<OperationResult<SupplementTrackerResponse>> CreateAsync(
        Guid userId,
        CreateSupplementTrackerRequest request,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<SupplementTrackerResponse>> GetMyTrackersAsync(Guid userId, CancellationToken cancellationToken);

    Task<OperationResult<SupplementTrackerResponse>> UpdateAsync(
        Guid trackerId,
        Guid userId,
        UpdateSupplementTrackerRequest request,
        CancellationToken cancellationToken);

    Task<OperationResult<bool>> DeleteAsync(Guid trackerId, Guid userId, CancellationToken cancellationToken);

    Task<OperationResult<SupplementTrackerResponse>> ConsumeAsync(
        Guid trackerId,
        Guid userId,
        ConsumeSupplementRequest request,
        CancellationToken cancellationToken);

    Task<OperationResult<StockStatusResponse>> GetStockStatusAsync(
        Guid trackerId,
        Guid userId,
        CancellationToken cancellationToken);

    Task<SupplementDashboardResponse> GetDashboardAsync(
        Guid userId,
        DateOnly? localDate,
        CancellationToken cancellationToken);
}
