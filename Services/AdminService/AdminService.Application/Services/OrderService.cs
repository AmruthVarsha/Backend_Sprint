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
        private readonly IUserSummaryRepository _userSummaryRepository;
        private readonly AdminOrderStatusUpdatePublisher _statusUpdatePublisher;

        public OrderService(
            IOrderSummaryRepository orderSummaryRepository, 
            IAuditLogRepository auditLogRepository,
            IUserSummaryRepository userSummaryRepository,
            AdminOrderStatusUpdatePublisher statusUpdatePublisher)
        {
            _orderSummaryRepository = orderSummaryRepository;
            _auditLogRepository = auditLogRepository;
            _userSummaryRepository = userSummaryRepository;
            _statusUpdatePublisher = statusUpdatePublisher;
        }

        public async Task<List<OrderSummaryDto>> GetAllOrdersAsync()
        {
            var orders = await _orderSummaryRepository.GetAllAsync();
            var dtos = new List<OrderSummaryDto>();

            // Optimize by fetching needed users or fetching as needed
            // Assuming the scale is manageable for now, we iterate
            foreach (var o in orders)
            {
                var user = await _userSummaryRepository.GetByUserIdAsync(o.CustomerId);
                dtos.Add(new OrderSummaryDto
                {
                    OrderId = o.OrderId,
                    CustomerId = o.CustomerId,
                    CustomerName = user?.FullName ?? o.CustomerId,
                    RestaurantName = o.RestaurantName,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status.ToString(),
                    PlacedAt = o.PlacedAt,
                    LastUpdatedAt = o.LastUpdatedAt
                });
            }

            return dtos;
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

