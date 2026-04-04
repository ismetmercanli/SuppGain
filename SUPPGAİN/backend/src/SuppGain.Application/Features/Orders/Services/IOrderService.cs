using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Orders.Models;

namespace SuppGain.Application.Features.Orders.Services;

public interface IOrderService
{
    Task<OperationResult<OrderResponse>> CreateAsync(Guid userId, CancellationToken cancellationToken);
    Task<OperationResult<OrderResponse>> GetByIdAsync(Guid orderId, Guid requesterId, bool isAdmin, CancellationToken cancellationToken);
    Task<IReadOnlyList<OrderResponse>> GetMyOrdersAsync(Guid userId, CancellationToken cancellationToken);
}
