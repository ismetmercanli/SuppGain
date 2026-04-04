using SuppGain.Domain.Entities;

namespace SuppGain.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
    DateTime GetTokenExpiryUtc();
}
