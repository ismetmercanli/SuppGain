namespace SuppGain.Application.Features.Orders.Models;

public sealed class OrderResponse
{
    public Guid OrderId { get; init; }
    public Guid UserId { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public IReadOnlyList<OrderItemResponse> Items { get; init; } = Array.Empty<OrderItemResponse>();
    public DateTime CreatedAtUtc { get; init; }
}
