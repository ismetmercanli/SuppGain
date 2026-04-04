using Microsoft.EntityFrameworkCore;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Cart.Models;
using SuppGain.Application.Features.Cart.Services;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Services;

public class CartService : ICartService
{
    private readonly IApplicationDbContext _dbContext;

    public CartService(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OperationResult<CartResponse>> AddItemAsync(
        Guid userId,
        AddToCartRequest request,
        CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            return OperationResult<CartResponse>.Failure("USER_NOT_FOUND", "Kullanici bulunamadi.");
        }

        var product = await _dbContext.Products.FirstOrDefaultAsync(
            x => x.Id == request.ProductId,
            cancellationToken);

        if (product is null || !product.IsActive)
        {
            return OperationResult<CartResponse>.Failure("PRODUCT_NOT_FOUND", "Urun bulunamadi.");
        }

        var cart = await _dbContext.Carts
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(
                x => x.UserId == userId && !x.IsCheckedOut,
                cancellationToken);

        if (cart is null)
        {
            cart = new Cart
            {
                UserId = userId,
                IsCheckedOut = false
            };

            _dbContext.Carts.Add(cart);
        }

        var existingItem = cart.Items.FirstOrDefault(x => x.ProductId == request.ProductId);
        var targetQuantity = (existingItem?.Quantity ?? 0) + request.Quantity;

        if (product.Stock < targetQuantity)
        {
            return OperationResult<CartResponse>.Failure("OUT_OF_STOCK", "Yeterli stok bulunamadi.");
        }

        if (existingItem is null)
        {
            var newItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                Quantity = request.Quantity,
                UnitPrice = product.Price
            };

            // Explicitly add as Added entity; adding via navigation may be
            // interpreted as update when key is already set.
            _dbContext.CartItems.Add(newItem);
            cart.Items.Add(newItem);
        }
        else
        {
            existingItem.Quantity = targetQuantity;
            existingItem.UnitPrice = product.Price;
            existingItem.UpdatedAtUtc = DateTime.UtcNow;
        }

        cart.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<CartResponse>.Success(Map(cart));
    }

    public async Task<OperationResult<CartResponse>> GetMyCartAsync(Guid userId, CancellationToken cancellationToken)
    {
        var cart = await _dbContext.Carts
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(
                x => x.UserId == userId && !x.IsCheckedOut,
                cancellationToken);

        if (cart is null)
        {
            return OperationResult<CartResponse>.Success(new CartResponse
            {
                CartId = Guid.Empty,
                UserId = userId,
                Items = Array.Empty<CartItemResponse>(),
                TotalAmount = 0
            });
        }

        return OperationResult<CartResponse>.Success(Map(cart));
    }

    private static CartResponse Map(Cart cart)
    {
        var items = cart.Items
            .OrderBy(x => x.Product.Name)
            .Select(x => new CartItemResponse
            {
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice,
                LineTotal = x.Quantity * x.UnitPrice
            })
            .ToList();

        return new CartResponse
        {
            CartId = cart.Id,
            UserId = cart.UserId,
            Items = items,
            TotalAmount = items.Sum(x => x.LineTotal)
        };
    }
}
