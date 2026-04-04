namespace SuppGain.Application.Features.Cart.Models;

public sealed class CartResponse
{
    public Guid CartId { get; init; }
    public Guid UserId { get; init; }
    public IReadOnlyList<CartItemResponse> Items { get; init; } = Array.Empty<CartItemResponse>();
    public decimal TotalAmount { get; init; }
}
