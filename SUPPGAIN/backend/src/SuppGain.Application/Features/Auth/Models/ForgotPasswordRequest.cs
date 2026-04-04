using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.Auth.Models;

public sealed class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; init; } = string.Empty;
}
