using Microsoft.EntityFrameworkCore;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.WeeklyPrograms.Models;
using SuppGain.Application.Features.WeeklyPrograms.Services;
using SuppGain.Domain.Entities;
using System.Text.Json;

namespace SuppGain.Infrastructure.Services;

public class WeeklyProgramService : IWeeklyProgramService
{
    private readonly IApplicationDbContext _dbContext;

    public WeeklyProgramService(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<WeeklyProgramResponse>> GetMyProgramsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var list = await _dbContext.WeeklyPrograms
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return list.Select(Map).ToList();
    }

    public async Task<OperationResult<WeeklyProgramResponse>> CreateAsync(
        Guid userId,
        CreateWeeklyProgramRequest request,
        CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            return OperationResult<WeeklyProgramResponse>.Failure("USER_NOT_FOUND", "Kullanici bulunamadi.");
        }

        var weeklyProgram = new WeeklyProgram
        {
            UserId = userId,
            Title = request.Title.Trim(),
            ContentJson = string.IsNullOrWhiteSpace(request.ContentJson) ? "{}" : request.ContentJson.Trim()
        };

        _dbContext.WeeklyPrograms.Add(weeklyProgram);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<WeeklyProgramResponse>.Success(Map(weeklyProgram));
    }

    public async Task<OperationResult<WeeklyProgramResponse>> AutoCreateFromPurchasesAsync(
        Guid userId,
        AutoCreateWeeklyProgramRequest request,
        CancellationToken cancellationToken)
    {
        var purchasedProducts = await _dbContext.Orders
            .Where(x => x.UserId == userId)
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .SelectMany(x => x.Items)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => x.Product)
            .Where(x => x.IsActive)
            .ToListAsync(cancellationToken);

        if (purchasedProducts.Count == 0)
        {
            return OperationResult<WeeklyProgramResponse>.Failure(
                "NO_PURCHASED_PRODUCTS",
                "Otomatik program icin satin alinmis urun bulunamadi.");
        }

        var selectedIds = request.SelectedProductIds?
            .Distinct()
            .ToHashSet() ?? new HashSet<Guid>();

        var selectedProducts = selectedIds.Count > 0
            ? purchasedProducts.Where(x => selectedIds.Contains(x.Id)).ToList()
            : purchasedProducts;

        var uniqueProducts = selectedProducts
            .GroupBy(x => x.Id)
            .Select(g => g.First())
            .Take(7)
            .ToList();

        if (uniqueProducts.Count == 0)
        {
            return OperationResult<WeeklyProgramResponse>.Failure(
                "NO_VALID_SELECTED_PRODUCTS",
                "Secilen urunler satin alinan urunlerde bulunamadi.");
        }

        var slots = new[] { "Sabah", "Ogle", "Aksam" };
        var days = new[] { "Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi", "Pazar" };
        var entries = new List<object>();

        for (var dayIndex = 0; dayIndex < days.Length; dayIndex++)
        {
            for (var slotIndex = 0; slotIndex < slots.Length; slotIndex++)
            {
                var product = uniqueProducts[(dayIndex + slotIndex) % uniqueProducts.Count];
                entries.Add(new
                {
                    day = days[dayIndex],
                    slot = slots[slotIndex],
                    productId = product.Id,
                    productName = product.Name,
                    category = product.Category,
                    dosage = slotIndex == 0 ? "1 olcek / 1 kapsul" : slotIndex == 1 ? "1 doz" : "1 doz",
                    note = slotIndex == 0 ? "Kahvalti ile" : slotIndex == 1 ? "Antrenman oncesi/sonrasi" : "Aksam ogunu ile"
                });
            }
        }

        var contentJson = JsonSerializer.Serialize(new
        {
            source = "auto-from-purchases",
            generatedAtUtc = DateTime.UtcNow,
            products = uniqueProducts.Select(x => new
            {
                id = x.Id,
                name = x.Name,
                category = x.Category
            }),
            schedule = entries
        });

        var weeklyProgram = new WeeklyProgram
        {
            UserId = userId,
            Title = string.IsNullOrWhiteSpace(request.Title)
                ? $"Haftalik Program - {DateTime.UtcNow:yyyy-MM-dd}"
                : request.Title.Trim(),
            ContentJson = contentJson
        };

        _dbContext.WeeklyPrograms.Add(weeklyProgram);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<WeeklyProgramResponse>.Success(Map(weeklyProgram));
    }

    public async Task<OperationResult<WeeklyProgramResponse>> UpdateAsync(
        Guid programId,
        Guid userId,
        UpdateWeeklyProgramRequest request,
        CancellationToken cancellationToken)
    {
        var weeklyProgram = await _dbContext.WeeklyPrograms.FirstOrDefaultAsync(
            x => x.Id == programId,
            cancellationToken);

        if (weeklyProgram is null)
        {
            return OperationResult<WeeklyProgramResponse>.Failure("NOT_FOUND", "Haftalik program bulunamadi.");
        }

        if (weeklyProgram.UserId != userId)
        {
            return OperationResult<WeeklyProgramResponse>.Failure("FORBIDDEN", "Bu programi guncelleme yetkiniz yok.");
        }

        weeklyProgram.Title = request.Title.Trim();
        weeklyProgram.ContentJson = string.IsNullOrWhiteSpace(request.ContentJson) ? "{}" : request.ContentJson.Trim();
        weeklyProgram.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<WeeklyProgramResponse>.Success(Map(weeklyProgram));
    }

    public async Task<OperationResult<bool>> DeleteAsync(
        Guid programId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var weeklyProgram = await _dbContext.WeeklyPrograms.FirstOrDefaultAsync(
            x => x.Id == programId,
            cancellationToken);

        if (weeklyProgram is null)
        {
            return OperationResult<bool>.Failure("NOT_FOUND", "Haftalik program bulunamadi.");
        }

        if (weeklyProgram.UserId != userId)
        {
            return OperationResult<bool>.Failure("FORBIDDEN", "Bu programi silme yetkiniz yok.");
        }

        _dbContext.WeeklyPrograms.Remove(weeklyProgram);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<bool>.Success(true);
    }

    private static WeeklyProgramResponse Map(WeeklyProgram weeklyProgram)
    {
        return new WeeklyProgramResponse
        {
            ProgramId = weeklyProgram.Id,
            UserId = weeklyProgram.UserId,
            Title = weeklyProgram.Title,
            ContentJson = weeklyProgram.ContentJson,
            CreatedAtUtc = weeklyProgram.CreatedAtUtc,
            UpdatedAtUtc = weeklyProgram.UpdatedAtUtc
        };
    }
}
