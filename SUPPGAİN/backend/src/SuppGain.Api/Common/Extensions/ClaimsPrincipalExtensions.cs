using System.Security.Claims;
using SuppGain.Domain.Enums;

namespace SuppGain.Api.Common.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var userId) ? userId : null;
    }

    public static string? GetEmail(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Email)
            ?? user.FindFirstValue("email")
            ?? user.FindFirstValue("unique_name");
    }

    public static bool IsAdmin(this ClaimsPrincipal user)
    {
        return string.Equals(
            user.FindFirstValue(ClaimTypes.Role),
            UserRole.Admin.ToString(),
            StringComparison.OrdinalIgnoreCase);
    }
}
