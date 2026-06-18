using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using SuppGain.Application.Common.Interfaces;

namespace SuppGain.Infrastructure.Messaging;

public sealed class RabbitMqOrderEventPublisher : IOrderEventPublisher
{
    private readonly RabbitMqOptions _options;
    private readonly ILogger<RabbitMqOrderEventPublisher> _logger;

    public RabbitMqOrderEventPublisher(
        IOptions<RabbitMqOptions> options,
        ILogger<RabbitMqOrderEventPublisher> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task PublishOrderCreatedAsync(
        OrderCreatedEvent orderCreatedEvent,
        CancellationToken cancellationToken)
    {
        if (!_options.Enabled)
        {
            return;
        }

        try
        {
            var factory = new ConnectionFactory
            {
                HostName = _options.HostName,
                Port = _options.Port,
                UserName = _options.UserName,
                Password = _options.Password
            };

            await using var connection = await factory.CreateConnectionAsync(cancellationToken);
            await using var channel = await connection.CreateChannelAsync(cancellationToken: cancellationToken);

            await channel.QueueDeclareAsync(
                queue: _options.OrderCreatedQueue,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null,
                cancellationToken: cancellationToken);

            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(orderCreatedEvent));
            var properties = new BasicProperties
            {
                ContentType = "application/json",
                DeliveryMode = DeliveryModes.Persistent
            };

            await channel.BasicPublishAsync(
                exchange: string.Empty,
                routingKey: _options.OrderCreatedQueue,
                mandatory: false,
                basicProperties: properties,
                body: body,
                cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "OrderCreated RabbitMQ publish failed for order {OrderId}.",
                orderCreatedEvent.OrderId);
        }
    }
}
