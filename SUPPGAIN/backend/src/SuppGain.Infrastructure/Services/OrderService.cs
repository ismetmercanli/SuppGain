using Microsoft.EntityFrameworkCore;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Orders.Models;
using SuppGain.Application.Features.Orders.Services;
using SuppGain.Domain.Entities;
using SuppGain.Domain.Enums;
using SuppGain.Infrastructure.Persistence;

namespace SuppGain.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _dbContext;
    private readonly IOrderEventPublisher _orderEventPublisher;

    public OrderService(AppDbContext dbContext, IOrderEventPublisher orderEventPublisher)
    {
        _dbContext = dbContext;
        _orderEventPublisher = orderEventPublisher;
    }

    public async Task<OperationResult<OrderResponse>> CreateAsync(Guid userId, CancellationToken cancellationToken)
    {
        var cart = await _dbContext.Carts
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(
                x => x.UserId == userId && !x.IsCheckedOut,
                cancellationToken);

        if (cart is null || cart.Items.Count == 0)
        {
            return OperationResult<OrderResponse>.Failure("CART_EMPTY", "Aktif sepet bulunamadi veya sepet bos.");
        }

        await using var tx = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        foreach (var item in cart.Items)
        {
            if (!item.Product.IsActive)
            {
                return OperationResult<OrderResponse>.Failure("PRODUCT_NOT_AVAILABLE", "Sepetteki urunlerden biri aktif degil.");
            }

            if (item.Product.Stock < item.Quantity)
            {
                return OperationResult<OrderResponse>.Failure("OUT_OF_STOCK", $"{item.Product.Name} icin yeterli stok yok.");
            }
        }

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Created,
            TotalAmount = cart.Items.Sum(x => x.UnitPrice * x.Quantity)
        };

        foreach (var item in cart.Items)
        {
            item.Product.Stock -= item.Quantity;
            item.Product.UpdatedAtUtc = DateTime.UtcNow;

            order.Items.Add(new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            });
        }

        cart.IsCheckedOut = true;
        cart.UpdatedAtUtc = DateTime.UtcNow;

        _dbContext.Orders.Add(order);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        await _orderEventPublisher.PublishOrderCreatedAsync(
            new OrderCreatedEvent
            {
                OrderId = order.Id,
                UserId = order.UserId,
                TotalAmount = order.TotalAmount,
                CreatedAtUtc = order.CreatedAtUtc
            },
            cancellationToken);

        return OperationResult<OrderResponse>.Success(Map(order));
    }

    public async Task<OperationResult<OrderResponse>> GetByIdAsync(
        Guid orderId,
        Guid requesterId,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        var order = await _dbContext.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken);

        if (order is null)
        {
            return OperationResult<OrderResponse>.Failure("NOT_FOUND", "Siparis bulunamadi.");
        }

        if (!isAdmin && order.UserId != requesterId)
        {
            return OperationResult<OrderResponse>.Failure("FORBIDDEN", "Bu siparise erisim yetkiniz yok.");
        }

        return OperationResult<OrderResponse>.Success(Map(order));
    }

    public async Task<IReadOnlyList<OrderResponse>> GetMyOrdersAsync(Guid userId, CancellationToken cancellationToken)
    {
        var orders = await _dbContext.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return orders.Select(Map).ToList();
    }

    private static OrderResponse Map(Order order)
    {
        var items = order.Items
            .OrderBy(x => x.Product.Name)
            .Select(x => new OrderItemResponse
            {
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice,
                LineTotal = x.Quantity * x.UnitPrice
            })
            .ToList();

        return new OrderResponse
        {
            OrderId = order.Id,
            UserId = order.UserId,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            Items = items,
            CreatedAtUtc = order.CreatedAtUtc
        };
    }
}
