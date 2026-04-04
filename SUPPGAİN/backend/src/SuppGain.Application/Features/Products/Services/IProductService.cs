using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Products.Models;

namespace SuppGain.Application.Features.Products.Services;

public interface IProductService
{
    Task<IReadOnlyList<ProductResponse>> GetListAsync(ProductListQuery query, CancellationToken cancellationToken);
    Task<OperationResult<ProductResponse>> GetByIdAsync(Guid productId, CancellationToken cancellationToken);
    Task<OperationResult<ProductResponse>> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken);
    Task<OperationResult<ProductResponse>> UpdateAsync(Guid productId, UpdateProductRequest request, CancellationToken cancellationToken);
    Task<OperationResult<bool>> DeleteAsync(Guid productId, CancellationToken cancellationToken);
}
