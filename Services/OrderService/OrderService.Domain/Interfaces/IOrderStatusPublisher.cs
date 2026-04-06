using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Domain.Interfaces
{
    public interface IOrderStatusPublisher
    {
        public Task PublishOrderStatus(Guid orderId,
        string customerId,
        string restaurantName,
        decimal totalAmount,
        string status,
        DateTime placedAt);
    }
}
