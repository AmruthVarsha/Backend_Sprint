using MassTransit;
using Shared.Events;

namespace AdminService.Infrastructure.Messaging.Publishers
{
    public class AdminOrderStatusUpdatePublisher
    {
        private readonly IPublishEndpoint _publishEndpoint;

        public AdminOrderStatusUpdatePublisher(IPublishEndpoint publishEndpoint)
        {
            _publishEndpoint = publishEndpoint;
        }

        public async Task PublishOrderStatusUpdate(Guid orderId, string newStatus, string updatedBy, string reason)
        {
            await _publishEndpoint.Publish(new AdminOrderStatusUpdateEvent
            {
                OrderId = orderId,
                NewStatus = newStatus,
                UpdatedBy = updatedBy,
                Reason = reason,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }
}
