using OrderService.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using MassTransit;
using Shared.Events;
using OrderService.Domain.Enums;

namespace OrderService.Infrastructure.Messaging.Publishers
{
    public class OrderStatusPublisher : IOrderStatusPublisher
    {
        private readonly IPublishEndpoint _publishEndpoint;

        public OrderStatusPublisher(IPublishEndpoint publishEndpoint)
        {
            _publishEndpoint = publishEndpoint;
        }

        public async Task PublishOrderStatus(Guid orderId,string customerId,string restaurantName,decimal totalAmount,string status,DateTime placedAt)
        {
            await _publishEndpoint.Publish(new OrderStatusChangedEvent
            {
                OrderId = orderId,
                CustomerId = customerId,
                RestaurantName = restaurantName,
                TotalAmount = totalAmount,
                Status = status,
                PlacedAt = placedAt
            });
        }
    }
}
