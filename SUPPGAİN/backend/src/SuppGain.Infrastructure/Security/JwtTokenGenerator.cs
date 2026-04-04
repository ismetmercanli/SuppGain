using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Security;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly string _issuer;
    private readonly string _audience;
    private readonly string _key;
    private readonly int _expiryMinutes;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _issuer = configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT issuer is missing.");
        _audience = configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT audience is missing.");
        _key = configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is missing.");
        _expiryMinutes = int.TryParse(configuration["Jwt:ExpiryMinutes"], out var minutes) ? minutes : 120;
    }

    public string GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = GetTokenExpiryUtc();

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public DateTime GetTokenExpiryUtc()
    {
        return DateTime.UtcNow.AddMinutes(_expiryMinutes);
    }
}
