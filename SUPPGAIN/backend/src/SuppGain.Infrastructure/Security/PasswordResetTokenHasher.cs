using System.Security.Cryptography;
using System.Text;

namespace SuppGain.Infrastructure.Security;

public static class PasswordResetTokenHasher
{
    public static string GenerateRawToken()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    }

    public static string HashRawToken(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes);
    }
}
