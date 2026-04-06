using MassTransit;
using System;
using System.Collections.Generic;
using System.Text;
using Shared.Events;
using AdminService.Domain.Interfaces;
using AdminService.Domain.Entities;
using AdminService.Domain.Enums;

namespace AdminService.Infrastructure.Messaging.Consumers
{
    public class OrderStatusChangedConsumer : IConsumer<OrderStatusChangedEvent>
    {
        private readonly IOrderSummaryRepository _orderSummaryRepository;

        public OrderStatusChangedConsumer(IOrderSummaryRepository orderSummaryRepository)
        {
            _orderSummaryRepository = orderSummaryRepository;
        }

        public async Task Consume(ConsumeContext<OrderStatusChangedEvent> context)
        {
            var message = context.Message;

            var existing = await _orderSummaryRepository.GetByOrderIdAsync(message.OrderId);

            if(existing is null)
            {
                await _orderSummaryRepository.AddAsync(new OrderSummary
                {
                    Id = Guid.NewGuid(),
                    OrderId = message.OrderId,
                    CustomerId = message.CustomerId,
                    RestaurantName = message.RestaurantName,
                    TotalAmount = message.TotalAmount,
                    Status = Enum.Parse<OrderStatus>(message.Status),
                    PlacedAt = message.PlacedAt,
                    LastUpdatedAt = DateTime.UtcNow
                });
            }
            else
            {
                await _orderSummaryRepository.UpdateStatusAsync(
                    message.OrderId, Enum.Parse<OrderStatus>(message.Status), DateTime.UtcNow);
            }
        }
    }
}
