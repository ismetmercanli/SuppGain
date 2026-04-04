using SuppGain.Application.Features.Users.Models;

namespace SuppGain.Application.Features.Auth.Models;

public sealed class AuthResponse
{
    public string Token { get; init; } = string.Empty;
    public DateTime ExpiresAtUtc { get; init; }
    public UserResponse User { get; init; } = new();
}
