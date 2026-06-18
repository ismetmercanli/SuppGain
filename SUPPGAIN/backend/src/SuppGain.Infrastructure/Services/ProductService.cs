using Microsoft.EntityFrameworkCore;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Products.Models;
using SuppGain.Application.Features.Products.Services;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IProductCache _productCache;

    public ProductService(IApplicationDbContext dbContext, IProductCache productCache)
    {
        _dbContext = dbContext;
        _productCache = productCache;
    }

    public async Task<IReadOnlyList<ProductResponse>> GetListAsync(ProductListQuery query, CancellationToken cancellationToken)
    {
        var cached = await _productCache.GetProductsAsync(query, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var products = _dbContext.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Name))
        {
            var name = query.Name.Trim().ToLower();
            products = products.Where(x => x.Name.ToLower().Contains(name));
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
        {
            var category = query.Category.Trim().ToLower();
            products = products.Where(x => x.Category.ToLower() == category);
        }

        if (query.MinPrice.HasValue)
        {
            products = products.Where(x => x.Price >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            products = products.Where(x => x.Price <= query.MaxPrice.Value);
        }

        if (query.IsActive.HasValue)
        {
            products = products.Where(x => x.IsActive == query.IsActive.Value);
        }

        var list = await products
            .OrderBy(x => x.Name)
            .Select(x => Map(x))
            .ToListAsync(cancellationToken);

        await _productCache.SetProductsAsync(query, list, cancellationToken);

        return list;
    }

    public async Task<OperationResult<ProductResponse>> GetByIdAsync(Guid productId, CancellationToken cancellationToken)
    {
        var product = await _dbContext.Products.FirstOrDefaultAsync(
            x => x.Id == productId,
            cancellationToken);

        if (product is null)
        {
            return OperationResult<ProductResponse>.Failure("NOT_FOUND", "Urun bulunamadi.");
        }

        return OperationResult<ProductResponse>.Success(Map(product));
    }

    public async Task<OperationResult<ProductResponse>> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken)
    {
        var normalizedName = request.Name.Trim();
        var normalizedCategory = request.Category.Trim();

        var exists = await _dbContext.Products.AnyAsync(
            x => x.Name.ToLower() == normalizedName.ToLower() && x.Category.ToLower() == normalizedCategory.ToLower(),
            cancellationToken);

        if (exists)
        {
            return OperationResult<ProductResponse>.Failure("ALREADY_EXISTS", "Bu urun ayni kategori icinde zaten mevcut.");
        }

        var product = new Product
        {
            Name = normalizedName,
            Description = request.Description.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
            Price = request.Price,
            Stock = request.Stock,
            Category = normalizedCategory,
            IsActive = request.IsActive
        };

        _dbContext.Products.Add(product);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _productCache.InvalidateProductsAsync(cancellationToken);

        return OperationResult<ProductResponse>.Success(Map(product));
    }

    public async Task<OperationResult<ProductResponse>> UpdateAsync(
        Guid productId,
        UpdateProductRequest request,
        CancellationToken cancellationToken)
    {
        var product = await _dbContext.Products.FirstOrDefaultAsync(
            x => x.Id == productId,
            cancellationToken);

        if (product is null)
        {
            return OperationResult<ProductResponse>.Failure("NOT_FOUND", "Urun bulunamadi.");
        }

        var normalizedName = request.Name.Trim();
        var normalizedCategory = request.Category.Trim();

        var duplicate = await _dbContext.Products.AnyAsync(
            x => x.Id != productId
                && x.Name.ToLower() == normalizedName.ToLower()
                && x.Category.ToLower() == normalizedCategory.ToLower(),
            cancellationToken);

        if (duplicate)
        {
            return OperationResult<ProductResponse>.Failure("ALREADY_EXISTS", "Bu urun ayni kategori icinde zaten mevcut.");
        }

        product.Name = normalizedName;
        product.Description = request.Description.Trim();
        product.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim();
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.Category = normalizedCategory;
        product.IsActive = request.IsActive;
        product.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _productCache.InvalidateProductsAsync(cancellationToken);

        return OperationResult<ProductResponse>.Success(Map(product));
    }

    public async Task<OperationResult<bool>> DeleteAsync(Guid productId, CancellationToken cancellationToken)
    {
        var product = await _dbContext.Products.FirstOrDefaultAsync(
            x => x.Id == productId,
            cancellationToken);

        if (product is null)
        {
            return OperationResult<bool>.Failure("NOT_FOUND", "Urun bulunamadi.");
        }

        _dbContext.Products.Remove(product);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _productCache.InvalidateProductsAsync(cancellationToken);

        return OperationResult<bool>.Success(true);
    }

    private static ProductResponse Map(Product product)
    {
        return new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            ImageUrl = product.ImageUrl,
            Price = product.Price,
            Stock = product.Stock,
            Category = product.Category,
            IsActive = product.IsActive
        };
    }
}
