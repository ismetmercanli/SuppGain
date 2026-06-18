using SuppGain.Application.Features.Products.Models;

namespace SuppGain.Application.Common.Interfaces;

public interface IProductCache
{
    Task<IReadOnlyList<ProductResponse>?> GetProductsAsync(ProductListQuery query, CancellationToken cancellationToken);
    Task SetProductsAsync(ProductListQuery query, IReadOnlyList<ProductResponse> products, CancellationToken cancellationToken);
    Task InvalidateProductsAsync(CancellationToken cancellationToken);
}
