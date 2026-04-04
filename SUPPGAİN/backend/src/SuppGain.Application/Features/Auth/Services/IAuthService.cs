using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Auth.Models;

namespace SuppGain.Application.Features.Auth.Services;

public interface IAuthService
{
    Task<OperationResult<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<OperationResult<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<OperationResult<bool>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken);
    Task<OperationResult<bool>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
}
