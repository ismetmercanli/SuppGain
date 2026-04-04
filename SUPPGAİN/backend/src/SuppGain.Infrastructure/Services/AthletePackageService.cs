using Microsoft.EntityFrameworkCore;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.AthletePackages.Models;
using SuppGain.Application.Features.AthletePackages.Services;
using SuppGain.Domain.Entities;
using SuppGain.Domain.Enums;

namespace SuppGain.Infrastructure.Services;

public class AthletePackageService : IAthletePackageService
{
    private readonly IApplicationDbContext _dbContext;

    public AthletePackageService(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<AthletePackageResponse>> GetListAsync(AthletePackageListQuery query, CancellationToken cancellationToken)
    {
        var packages = _dbContext.AthletePackages
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.AthleteType)
            && Enum.TryParse<AthleteType>(query.AthleteType.Trim(), true, out var athleteType))
        {
            packages = packages.Where(x => x.AthleteType == athleteType);
        }

        if (query.IsActive.HasValue)
        {
            packages = packages.Where(x => x.IsActive == query.IsActive.Value);
        }

        var list = await packages
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return list.Select(Map).ToList();
    }

    public async Task<OperationResult<AthletePackageResponse>> GetByIdAsync(Guid packageId, CancellationToken cancellationToken)
    {
        var package = await _dbContext.AthletePackages
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == packageId, cancellationToken);

        if (package is null)
        {
            return OperationResult<AthletePackageResponse>.Failure("NOT_FOUND", "Paket bulunamadi.");
        }

        return OperationResult<AthletePackageResponse>.Success(Map(package));
    }

    public async Task<OperationResult<AthletePackageResponse>> CreateAsync(CreateAthletePackageRequest request, CancellationToken cancellationToken)
    {
        if (!TryParseAthleteType(request.AthleteType, out var athleteType))
        {
            return OperationResult<AthletePackageResponse>.Failure("INVALID_ATHLETE_TYPE", "Gecerli athlete type giriniz.");
        }

        if (request.Items.Count == 0)
        {
            return OperationResult<AthletePackageResponse>.Failure("PACKAGE_ITEMS_REQUIRED", "Paket en az bir urun icermeli.");
        }

        if (request.Items.GroupBy(x => x.ProductId).Any(g => g.Count() > 1))
        {
            return OperationResult<AthletePackageResponse>.Failure("DUPLICATE_PRODUCTS", "Pakette ayni urun birden fazla olamaz.");
        }

        var normalizedName = request.Name.Trim();

        var exists = await _dbContext.AthletePackages.AnyAsync(
            x => x.Name.ToLower() == normalizedName.ToLower() && x.AthleteType == athleteType,
            cancellationToken);

        if (exists)
        {
            return OperationResult<AthletePackageResponse>.Failure("ALREADY_EXISTS", "Bu sporcu tipi icin ayni isimde paket zaten mevcut.");
        }

        var productIds = request.Items.Select(x => x.ProductId).ToHashSet();
        var products = await _dbContext.Products
            .Where(x => productIds.Contains(x.Id))
            .ToListAsync(cancellationToken);

        if (products.Count != productIds.Count)
        {
            return OperationResult<AthletePackageResponse>.Failure("PRODUCT_NOT_FOUND", "Paket urunlerinden en az biri bulunamadi.");
        }

        var package = new AthletePackage
        {
            Name = normalizedName,
            Description = request.Description.Trim(),
            AthleteType = athleteType,
            DiscountPercentage = request.DiscountPercentage,
            IsActive = request.IsActive,
            Items = request.Items.Select(x => new AthletePackageItem
            {
                ProductId = x.ProductId,
                Quantity = x.Quantity
            }).ToList()
        };

        _dbContext.AthletePackages.Add(package);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await _dbContext.AthletePackages
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstAsync(x => x.Id == package.Id, cancellationToken);

        return OperationResult<AthletePackageResponse>.Success(Map(created));
    }

    public async Task<OperationResult<AthletePackageResponse>> UpdateAsync(
        Guid packageId,
        UpdateAthletePackageRequest request,
        CancellationToken cancellationToken)
    {
        var package = await _dbContext.AthletePackages
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == packageId, cancellationToken);

        if (package is null)
        {
            return OperationResult<AthletePackageResponse>.Failure("NOT_FOUND", "Paket bulunamadi.");
        }

        if (!TryParseAthleteType(request.AthleteType, out var athleteType))
        {
            return OperationResult<AthletePackageResponse>.Failure("INVALID_ATHLETE_TYPE", "Gecerli athlete type giriniz.");
        }

        if (request.Items.Count == 0)
        {
            return OperationResult<AthletePackageResponse>.Failure("PACKAGE_ITEMS_REQUIRED", "Paket en az bir urun icermeli.");
        }

        if (request.Items.GroupBy(x => x.ProductId).Any(g => g.Count() > 1))
        {
            return OperationResult<AthletePackageResponse>.Failure("DUPLICATE_PRODUCTS", "Pakette ayni urun birden fazla olamaz.");
        }

        var normalizedName = request.Name.Trim();
        var duplicate = await _dbContext.AthletePackages.AnyAsync(
            x => x.Id != packageId
                && x.Name.ToLower() == normalizedName.ToLower()
                && x.AthleteType == athleteType,
            cancellationToken);

        if (duplicate)
        {
            return OperationResult<AthletePackageResponse>.Failure("ALREADY_EXISTS", "Bu sporcu tipi icin ayni isimde paket zaten mevcut.");
        }

        var productIds = request.Items.Select(x => x.ProductId).ToHashSet();
        var products = await _dbContext.Products
            .Where(x => productIds.Contains(x.Id))
            .ToListAsync(cancellationToken);

        if (products.Count != productIds.Count)
        {
            return OperationResult<AthletePackageResponse>.Failure("PRODUCT_NOT_FOUND", "Paket urunlerinden en az biri bulunamadi.");
        }

        package.Name = normalizedName;
        package.Description = request.Description.Trim();
        package.AthleteType = athleteType;
        package.DiscountPercentage = request.DiscountPercentage;
        package.IsActive = request.IsActive;
        package.UpdatedAtUtc = DateTime.UtcNow;

        _dbContext.AthletePackageItems.RemoveRange(package.Items);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var newItems = request.Items.Select(x => new AthletePackageItem
        {
            AthletePackageId = package.Id,
            ProductId = x.ProductId,
            Quantity = x.Quantity
        });

        _dbContext.AthletePackageItems.AddRange(newItems);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var updated = await _dbContext.AthletePackages
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstAsync(x => x.Id == package.Id, cancellationToken);

        return OperationResult<AthletePackageResponse>.Success(Map(updated));
    }

    public async Task<OperationResult<bool>> DeleteAsync(Guid packageId, CancellationToken cancellationToken)
    {
        var package = await _dbContext.AthletePackages.FirstOrDefaultAsync(x => x.Id == packageId, cancellationToken);
        if (package is null)
        {
            return OperationResult<bool>.Failure("NOT_FOUND", "Paket bulunamadi.");
        }

        _dbContext.AthletePackages.Remove(package);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<bool>.Success(true);
    }

    private static bool TryParseAthleteType(string value, out AthleteType athleteType)
    {
        return Enum.TryParse(value.Trim(), true, out athleteType);
    }

    private static AthletePackageResponse Map(AthletePackage package)
    {
        var items = package.Items
            .OrderBy(x => x.Product.Name)
            .Select(x => new AthletePackageItemResponse
            {
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                Category = x.Product.Category,
                UnitPrice = x.Product.Price,
                Quantity = x.Quantity,
                LineTotal = x.Product.Price * x.Quantity
            })
            .ToList();

        var baseTotal = items.Sum(x => x.LineTotal);
        var discountAmount = Math.Round(baseTotal * (package.DiscountPercentage / 100m), 2, MidpointRounding.AwayFromZero);
        var finalPrice = baseTotal - discountAmount;

        return new AthletePackageResponse
        {
            Id = package.Id,
            Name = package.Name,
            Description = package.Description,
            AthleteType = package.AthleteType.ToString(),
            DiscountPercentage = package.DiscountPercentage,
            IsActive = package.IsActive,
            BaseTotalPrice = baseTotal,
            DiscountAmount = discountAmount,
            FinalPrice = finalPrice,
            Items = items
        };
    }
}
