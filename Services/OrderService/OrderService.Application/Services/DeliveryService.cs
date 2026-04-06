using OrderService.Application.DTOs.Delivery;
using OrderService.Application.Exceptions;
using OrderService.Application.Interfaces;
using OrderService.Domain.Enums;
using OrderService.Domain.Interfaces;

namespace OrderService.Application.Services
{
    public class DeliveryService : IDeliveryService
    {
        private readonly IDeliveryAssignmentRepository _deliveryRepository;
        private readonly IOrderRepository _orderRepository;

        public DeliveryService(IDeliveryAssignmentRepository deliveryRepository, IOrderRepository orderRepository)
        {
            _deliveryRepository = deliveryRepository;
            _orderRepository = orderRepository;
        }

        public async Task<IEnumerable<DeliveryAssignmentResponseDTO>> GetAssignmentsAsync(string agentId)
        {
            var assignments = await _deliveryRepository.GetByAgentId(agentId);
            return assignments.Select(a => new DeliveryAssignmentResponseDTO
            {
                Id = a.Id,
                OrderId = a.OrderId,
                DeliveryAgentId = a.DeliveryAgentId,
                Status = a.Status,
                Street = a.Order?.Street ?? string.Empty,
                City = a.Order?.City ?? string.Empty,
                State = a.Order?.State ?? string.Empty,
                Pincode = a.Order?.Pincode ?? string.Empty,
                TotalAmount = a.Order?.TotalAmount ?? 0,
                PickedUpAt = a.PickedUpAt,
                DeliveredAt = a.DeliveredAt
            });
        }

        public async Task<DeliveryAssignmentResponseDTO> UpdateDeliveryStatusAsync(Guid id, string agentId, UpdateDeliveryStatusDTO dto)
        {
            var assignment = await _deliveryRepository.GetById(id);
            if (assignment == null)
                throw new NotFoundException("DeliveryAssignment", id);

            if (assignment.DeliveryAgentId != agentId)
                throw new ForbiddenException("You are not assigned to this delivery.");

            if (!IsValidTransition(assignment.Status, dto.Status))
                throw new BadRequestException($"Cannot transition from '{assignment.Status}' to '{dto.Status}'.");

            assignment.Status = dto.Status;
            UpdateDeliveryTimestamps(assignment, dto.Status);
            await _deliveryRepository.UpdateAsync(assignment);

            await SyncOrderStatus(assignment.OrderId, dto.Status);

            return MapToResponse(assignment);
        }

        private static bool IsValidTransition(DeliveryStatus from, DeliveryStatus to)
        {
            return (from, to) switch
            {
                (DeliveryStatus.Assigned, DeliveryStatus.PickedUp) => true,
                (DeliveryStatus.PickedUp, DeliveryStatus.Delivered) => true,
                _ => false
            };
        }

        private static void UpdateDeliveryTimestamps(Domain.Entities.DeliveryAssignment assignment, DeliveryStatus status)
        {
            if (status == DeliveryStatus.PickedUp)
                assignment.PickedUpAt = DateTime.UtcNow;
            else if (status == DeliveryStatus.Delivered)
                assignment.DeliveredAt = DateTime.UtcNow;
        }

        private async Task SyncOrderStatus(Guid orderId, DeliveryStatus deliveryStatus)
        {
            var order = await _orderRepository.GetById(orderId);
            if (order == null)
                return;

            var newOrderStatus = deliveryStatus switch
            {
                DeliveryStatus.Assigned => OrderStatus.OutForDelivery,
                DeliveryStatus.PickedUp => OrderStatus.PickedUp,
                DeliveryStatus.Delivered => OrderStatus.Delivered,
                _ => order.Status
            };

            if (newOrderStatus != order.Status)
            {
                order.Status = newOrderStatus;
                order.UpdatedAt = DateTime.UtcNow;
                await _orderRepository.UpdateAsync(order);
            }
        }

        private static DeliveryAssignmentResponseDTO MapToResponse(Domain.Entities.DeliveryAssignment assignment)
        {
            return new DeliveryAssignmentResponseDTO
            {
                Id = assignment.Id,
                OrderId = assignment.OrderId,
                DeliveryAgentId = assignment.DeliveryAgentId,
                Status = assignment.Status,
                Street = assignment.Order?.Street ?? string.Empty,
                City = assignment.Order?.City ?? string.Empty,
                State = assignment.Order?.State ?? string.Empty,
                Pincode = assignment.Order?.Pincode ?? string.Empty,
                TotalAmount = assignment.Order?.TotalAmount ?? 0,
                PickedUpAt = assignment.PickedUpAt,
                DeliveredAt = assignment.DeliveredAt
            };
        }
    }
}
