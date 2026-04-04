using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Cart.Models;

namespace SuppGain.Application.Features.Cart.Services;

public interface ICartService
{
    Task<OperationResult<CartResponse>> AddItemAsync(Guid userId, AddToCartRequest request, CancellationToken cancellationToken);
    Task<OperationResult<CartResponse>> GetMyCartAsync(Guid userId, CancellationToken cancellationToken);
}
