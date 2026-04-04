using Microsoft.EntityFrameworkCore;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.SupplementInfos.Models;
using SuppGain.Application.Features.SupplementInfos.Services;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Services;

public class SupplementInfoService : ISupplementInfoService
{
    private readonly IApplicationDbContext _dbContext;

    public SupplementInfoService(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<SupplementInfoResponse>> GetListAsync(
        SupplementInfoListQuery query,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        var items = _dbContext.SupplementInfos.AsQueryable();

        if (!isAdmin)
        {
            items = items.Where(x => x.IsPublished);
        }
        else if (query.IsPublished.HasValue)
        {
            items = items.Where(x => x.IsPublished == query.IsPublished.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim().ToLower();
            items = items.Where(x => x.Title.ToLower().Contains(keyword) || x.Summary.ToLower().Contains(keyword));
        }

        if (!string.IsNullOrWhiteSpace(query.TargetAudience))
        {
            var target = query.TargetAudience.Trim().ToLower();
            items = items.Where(x => x.TargetAudience.ToLower() == target);
        }

        return await items
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => Map(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<OperationResult<SupplementInfoResponse>> GetByIdAsync(
        Guid id,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        var item = await _dbContext.SupplementInfos.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (item is null)
        {
            return OperationResult<SupplementInfoResponse>.Failure("NOT_FOUND", "Supplement bilgisi bulunamadi.");
        }

        if (!isAdmin && !item.IsPublished)
        {
            return OperationResult<SupplementInfoResponse>.Failure("NOT_FOUND", "Supplement bilgisi bulunamadi.");
        }

        return OperationResult<SupplementInfoResponse>.Success(Map(item));
    }

    public async Task<OperationResult<SupplementInfoResponse>> CreateAsync(
        CreateSupplementInfoRequest request,
        CancellationToken cancellationToken)
    {
        var title = request.Title.Trim();
        var exists = await _dbContext.SupplementInfos.AnyAsync(
            x => x.Title.ToLower() == title.ToLower(),
            cancellationToken);

        if (exists)
        {
            return OperationResult<SupplementInfoResponse>.Failure("ALREADY_EXISTS", "Bu baslikla kayit zaten mevcut.");
        }

        var item = new SupplementInfo
        {
            Title = title,
            Summary = request.Summary.Trim(),
            Content = request.Content.Trim(),
            Benefits = request.Benefits.Trim(),
            UsageInstructions = request.UsageInstructions.Trim(),
            Warnings = request.Warnings.Trim(),
            SideEffects = request.SideEffects.Trim(),
            TargetAudience = request.TargetAudience.Trim(),
            References = request.References.Trim(),
            IsPublished = request.IsPublished
        };

        _dbContext.SupplementInfos.Add(item);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<SupplementInfoResponse>.Success(Map(item));
    }

    public async Task<OperationResult<SupplementInfoResponse>> UpdateAsync(
        Guid id,
        UpdateSupplementInfoRequest request,
        CancellationToken cancellationToken)
    {
        var item = await _dbContext.SupplementInfos.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (item is null)
        {
            return OperationResult<SupplementInfoResponse>.Failure("NOT_FOUND", "Supplement bilgisi bulunamadi.");
        }

        var title = request.Title.Trim();
        var duplicate = await _dbContext.SupplementInfos.AnyAsync(
            x => x.Id != id && x.Title.ToLower() == title.ToLower(),
            cancellationToken);

        if (duplicate)
        {
            return OperationResult<SupplementInfoResponse>.Failure("ALREADY_EXISTS", "Bu baslikla kayit zaten mevcut.");
        }

        item.Title = title;
        item.Summary = request.Summary.Trim();
        item.Content = request.Content.Trim();
        item.Benefits = request.Benefits.Trim();
        item.UsageInstructions = request.UsageInstructions.Trim();
        item.Warnings = request.Warnings.Trim();
        item.SideEffects = request.SideEffects.Trim();
        item.TargetAudience = request.TargetAudience.Trim();
        item.References = request.References.Trim();
        item.IsPublished = request.IsPublished;
        item.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<SupplementInfoResponse>.Success(Map(item));
    }

    public async Task<OperationResult<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await _dbContext.SupplementInfos.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (item is null)
        {
            return OperationResult<bool>.Failure("NOT_FOUND", "Supplement bilgisi bulunamadi.");
        }

        _dbContext.SupplementInfos.Remove(item);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<bool>.Success(true);
    }

    private static SupplementInfoResponse Map(SupplementInfo item)
    {
        return new SupplementInfoResponse
        {
            Id = item.Id,
            Title = item.Title,
            Summary = item.Summary,
            Content = item.Content,
            Benefits = item.Benefits,
            UsageInstructions = item.UsageInstructions,
            Warnings = item.Warnings,
            SideEffects = item.SideEffects,
            TargetAudience = item.TargetAudience,
            References = item.References,
            IsPublished = item.IsPublished,
            CreatedAtUtc = item.CreatedAtUtc,
            UpdatedAtUtc = item.UpdatedAtUtc
        };
    }
}
