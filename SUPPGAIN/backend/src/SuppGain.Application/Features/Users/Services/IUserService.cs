using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Users.Models;

namespace SuppGain.Application.Features.Users.Services;

public interface IUserService
{
    Task<OperationResult<UserResponse>> GetByIdAsync(Guid userId, Guid requesterId, bool isAdmin, CancellationToken cancellationToken);
    Task<OperationResult<UserResponse>> UpdateAsync(Guid userId, Guid requesterId, bool isAdmin, UpdateUserRequest request, CancellationToken cancellationToken);
    Task<OperationResult<bool>> DeleteAsync(Guid userId, Guid requesterId, bool isAdmin, CancellationToken cancellationToken);
}
