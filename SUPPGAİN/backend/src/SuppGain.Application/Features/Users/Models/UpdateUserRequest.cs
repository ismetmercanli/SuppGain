using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.Users.Models;

public sealed class UpdateUserRequest
{
    [Required]
    [MaxLength(50)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; init; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; init; }

    [Range(10, 120)]
    public int? Age { get; init; }

    [MaxLength(20)]
    public string? Gender { get; init; }

    [Range(typeof(decimal), "50", "280")]
    public decimal? HeightCm { get; init; }

    [Range(typeof(decimal), "25", "400")]
    public decimal? WeightKg { get; init; }
}
