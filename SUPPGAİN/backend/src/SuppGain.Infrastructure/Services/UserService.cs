using Microsoft.EntityFrameworkCore;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Application.Features.Users.Models;
using SuppGain.Application.Features.Users.Services;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IApplicationDbContext _dbContext;

    public UserService(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OperationResult<UserResponse>> GetByIdAsync(
        Guid userId,
        Guid requesterId,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        if (!isAdmin && requesterId != userId)
        {
            return OperationResult<UserResponse>.Failure("FORBIDDEN", "Bu kayda erisim yetkiniz yok.");
        }

        var user = await _dbContext.Users.FirstOrDefaultAsync(
            x => x.Id == userId,
            cancellationToken);

        if (user is null)
        {
            return OperationResult<UserResponse>.Failure("NOT_FOUND", "Kullanici bulunamadi.");
        }

        return OperationResult<UserResponse>.Success(Map(user));
    }

    public async Task<OperationResult<UserResponse>> UpdateAsync(
        Guid userId,
        Guid requesterId,
        bool isAdmin,
        UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        if (!isAdmin && requesterId != userId)
        {
            return OperationResult<UserResponse>.Failure("FORBIDDEN", "Bu kaydi guncelleme yetkiniz yok.");
        }

        var user = await _dbContext.Users.FirstOrDefaultAsync(
            x => x.Id == userId,
            cancellationToken);

        if (user is null)
        {
            return OperationResult<UserResponse>.Failure("NOT_FOUND", "Kullanici bulunamadi.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var isEmailInUse = await _dbContext.Users.AnyAsync(
            x => x.Id != userId && x.Email == normalizedEmail,
            cancellationToken);

        if (isEmailInUse)
        {
            return OperationResult<UserResponse>.Failure("EMAIL_ALREADY_EXISTS", "Bu email zaten kullaniliyor.");
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Email = normalizedEmail;
        user.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        user.Age = request.Age;
        user.Gender = string.IsNullOrWhiteSpace(request.Gender) ? null : request.Gender.Trim();
        user.HeightCm = request.HeightCm;
        user.WeightKg = request.WeightKg;
        user.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<UserResponse>.Success(Map(user));
    }

    public async Task<OperationResult<bool>> DeleteAsync(
        Guid userId,
        Guid requesterId,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        if (!isAdmin && requesterId != userId)
        {
            return OperationResult<bool>.Failure("FORBIDDEN", "Bu kaydi silme yetkiniz yok.");
        }

        var user = await _dbContext.Users.FirstOrDefaultAsync(
            x => x.Id == userId,
            cancellationToken);

        if (user is null)
        {
            return OperationResult<bool>.Failure("NOT_FOUND", "Kullanici bulunamadi.");
        }

        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<bool>.Success(true);
    }

    private static UserResponse Map(User user)
    {
        return new UserResponse
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
        };
    }
}
