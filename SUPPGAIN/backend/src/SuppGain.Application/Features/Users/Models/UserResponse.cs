namespace SuppGain.Application.Features.Users.Models;

public sealed class UserResponse
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public int? Age { get; init; }
    public string? Gender { get; init; }
    public decimal? HeightCm { get; init; }
    public decimal? WeightKg { get; init; }
    public bool IsActive { get; init; }
    public string Role { get; init; } = string.Empty;
}
