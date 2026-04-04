using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.Auth.Models;

public sealed class ResetPasswordRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [MinLength(64)]
    [MaxLength(128)]
    public string Token { get; init; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    public string NewPassword { get; init; } = string.Empty;
}
