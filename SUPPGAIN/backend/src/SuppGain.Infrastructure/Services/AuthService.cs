using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Auth.Models;
using SuppGain.Application.Features.Auth.Services;
using SuppGain.Application.Features.Users.Models;
using SuppGain.Domain.Entities;
using SuppGain.Domain.Enums;
using SuppGain.Infrastructure.Email;
using SuppGain.Infrastructure.Security;

namespace SuppGain.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IEmailSender _emailSender;
    private readonly AppOptions _appOptions;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IApplicationDbContext dbContext,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IEmailSender emailSender,
        IOptions<AppOptions> appOptions,
        ILogger<AuthService> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _emailSender = emailSender;
        _appOptions = appOptions.Value;
        _logger = logger;
    }

    public async Task<OperationResult<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var emailExists = await _dbContext.Users.AnyAsync(
            x => x.Email == email,
            cancellationToken);

        if (emailExists)
        {
            return OperationResult<AuthResponse>.Failure("EMAIL_ALREADY_EXISTS", "Bu email zaten kullaniliyor.");
        }

        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            Role = UserRole.User
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<AuthResponse>.Success(CreateAuthResponse(user));
    }

    public async Task<OperationResult<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _dbContext.Users.FirstOrDefaultAsync(
            x => x.Email == email,
            cancellationToken);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return OperationResult<AuthResponse>.Failure("INVALID_CREDENTIALS", "Email veya sifre hatali.");
        }

        if (!user.IsActive)
        {
            return OperationResult<AuthResponse>.Failure("USER_DISABLED", "Kullanici hesabi aktif degil.");
        }

        return OperationResult<AuthResponse>.Success(CreateAuthResponse(user));
    }

    public async Task<OperationResult<bool>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (user is null)
        {
            return OperationResult<bool>.Success(true);
        }

        var rawToken = PasswordResetTokenHasher.GenerateRawToken();
        user.PasswordResetTokenHash = PasswordResetTokenHasher.HashRawToken(rawToken);
        user.PasswordResetExpiresUtc = DateTime.UtcNow.AddHours(24);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var baseUrl = _appOptions.PublicFrontendUrl.TrimEnd('/');
        var link =
            $"{baseUrl}/reset-password?email={Uri.EscapeDataString(user.Email)}&token={Uri.EscapeDataString(rawToken)}";

        var body =
            "SuppGain sifre sifirlama talebin alindi.\n\n" +
            "Asagidaki baglantiya tikla (24 saat gecerli):\n" +
            link +
            "\n\nBu talebi sen yapmadıysan bu e-postayı yok say.";

        try
        {
            await _emailSender.SendAsync(user.Email, "SuppGain sifre sifirlama", body, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sifre sifirlama e-postasi gonderilemedi: {Email}", user.Email);
        }

        return OperationResult<bool>.Success(true);
    }

    public async Task<OperationResult<bool>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var tokenHash = PasswordResetTokenHasher.HashRawToken(request.Token.Trim());

        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (user is null
            || string.IsNullOrEmpty(user.PasswordResetTokenHash)
            || !string.Equals(user.PasswordResetTokenHash, tokenHash, StringComparison.OrdinalIgnoreCase)
            || user.PasswordResetExpiresUtc is null
            || user.PasswordResetExpiresUtc <= DateTime.UtcNow)
        {
            return OperationResult<bool>.Failure("INVALID_TOKEN", "Baglanti gecersiz veya suresi dolmus.");
        }

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetExpiresUtc = null;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<bool>.Success(true);
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        return new AuthResponse
        {
            Token = _jwtTokenGenerator.GenerateToken(user),
            ExpiresAtUtc = _jwtTokenGenerator.GetTokenExpiryUtc(),
            User = new UserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone,
                Age = user.Age,
                Gender = user.Gender,
                HeightCm = user.HeightCm,
                WeightKg = user.WeightKg,
                IsActive = user.IsActive,
                Role = user.Role.ToString()
            }
        };
    }
}
