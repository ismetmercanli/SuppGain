using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.WeeklyPrograms.Models;

namespace SuppGain.Application.Features.WeeklyPrograms.Services;

public interface IWeeklyProgramService
{
    Task<IReadOnlyList<WeeklyProgramResponse>> GetMyProgramsAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<OperationResult<WeeklyProgramResponse>> CreateAsync(
        Guid userId,
        CreateWeeklyProgramRequest request,
        CancellationToken cancellationToken);

    Task<OperationResult<WeeklyProgramResponse>> AutoCreateFromPurchasesAsync(
        Guid userId,
        AutoCreateWeeklyProgramRequest request,
        CancellationToken cancellationToken);

    Task<OperationResult<WeeklyProgramResponse>> UpdateAsync(
        Guid programId,
        Guid userId,
        UpdateWeeklyProgramRequest request,
        CancellationToken cancellationToken);

    Task<OperationResult<bool>> DeleteAsync(
        Guid programId,
        Guid userId,
        CancellationToken cancellationToken);
}
