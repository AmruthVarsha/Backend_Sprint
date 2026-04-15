using MassTransit;
using Shared.Events;
using OrderService.Domain.Interfaces;
using OrderService.Domain.Enums;

namespace OrderService.Infrastructure.Messaging.Consumers
{
    public class AdminOrderStatusUpdateConsumer : IConsumer<AdminOrderStatusUpdateEvent>
    {
        private readonly IOrderRepository _orderRepository;

        public AdminOrderStatusUpdateConsumer(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }

        public async Task Consume(ConsumeContext<AdminOrderStatusUpdateEvent> context)
        {
            var message = context.Message;

            var order = await _orderRepository.GetById(message.OrderId);
            if (order == null)
            {
                return;
            }

            if (Enum.TryParse<OrderStatus>(message.NewStatus, out var newStatus))
            {
                order.Status = newStatus;
                order.UpdatedAt = message.UpdatedAt;
                await _orderRepository.UpdateAsync(order);
            }
        }
    }
}
