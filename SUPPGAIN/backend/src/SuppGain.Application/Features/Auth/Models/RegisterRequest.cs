using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.Auth.Models;

public sealed class RegisterRequest
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

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    public string Password { get; init; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; init; }
}
