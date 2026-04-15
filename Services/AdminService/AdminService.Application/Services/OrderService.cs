using AdminService.Application.DTOs.Orders;
using AdminService.Application.Exceptions;
using AdminService.Application.Interfaces.Services;
using AdminService.Domain.Enums;
using AdminService.Domain.Interfaces;
using AdminService.Infrastructure.Messaging.Publishers;

namespace AdminService.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderSummaryRepository _orderSummaryRepository;
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly AdminOrderStatusUpdatePublisher _statusUpdatePublisher;

        public OrderService(
            IOrderSummaryRepository orderSummaryRepository, 
            IAuditLogRepository auditLogRepository,
            AdminOrderStatusUpdatePublisher statusUpdatePublisher)
        {
            _orderSummaryRepository = orderSummaryRepository;
            _auditLogRepository = auditLogRepository;
            _statusUpdatePublisher = statusUpdatePublisher;
        }

        public async Task<List<OrderSummaryDto>> GetAllOrdersAsync()
        {
            var orders = await _orderSummaryRepository.GetAllAsync();

            return orders.Select(o => new OrderSummaryDto
            {
                OrderId = o.OrderId,
                CustomerId = o.CustomerId,
                RestaurantName = o.RestaurantName,
                TotalAmount = o.TotalAmount,
                Status = o.Status.ToString(),
                PlacedAt = o.PlacedAt,
                LastUpdatedAt = o.LastUpdatedAt
            }).ToList();
        }

        public async Task UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusDto dto, string adminId)
        {
            var order = await _orderSummaryRepository.GetByOrderIdAsync(orderId);
            if (order == null)
                throw new NotFoundException("Order", orderId);

            await _orderSummaryRepository.UpdateStatusAsync(orderId, dto.NewStatus, DateTime.UtcNow);

            var auditLog = new Domain.Entities.AuditLog
            {
                OrderId = orderId,
                PerformedByAdminId = adminId,
                Action = $"Status updated to {dto.NewStatus}",
                Reason = dto.Reason,
                PerformedAt = DateTime.UtcNow
            };

            await _auditLogRepository.AddAsync(auditLog);

            // Publish event to sync status back to OrderService
            await _statusUpdatePublisher.PublishOrderStatusUpdate(
                orderId, 
                dto.NewStatus.ToString(), 
                adminId, 
                dto.Reason);
        }
    }
}
