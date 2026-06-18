namespace SuppGain.Application.Common.Interfaces;

public interface IOrderEventPublisher
{
    Task PublishOrderCreatedAsync(OrderCreatedEvent orderCreatedEvent, CancellationToken cancellationToken);
}

public sealed class OrderCreatedEvent
{
    public Guid OrderId { get; init; }
    public Guid UserId { get; init; }
    public decimal TotalAmount { get; init; }
    public DateTime CreatedAtUtc { get; init; }
}
