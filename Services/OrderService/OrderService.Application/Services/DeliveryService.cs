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

        private static readonly Dictionary<DeliveryStatus, DeliveryStatus> AllowedTransitions = new()
        {
            [DeliveryStatus.Assigned] = DeliveryStatus.PickedUp,
            [DeliveryStatus.PickedUp] = DeliveryStatus.Delivered
        };

        private static readonly Dictionary<DeliveryStatus, OrderStatus> OrderStatusSync = new()
        {
            [DeliveryStatus.PickedUp] = OrderStatus.PickedUp,
            [DeliveryStatus.Delivered] = OrderStatus.Delivered
        };

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
                DeliveryAddress = a.Order?.DeliveryAddress ?? string.Empty,
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

            if (!AllowedTransitions.TryGetValue(assignment.Status, out var next) || next != dto.Status)
                throw new BadRequestException($"Cannot transition delivery from '{assignment.Status}' to '{dto.Status}'.");

            assignment.Status = dto.Status;

            if (dto.Status == DeliveryStatus.PickedUp)
                assignment.PickedUpAt = DateTime.UtcNow;
            else if (dto.Status == DeliveryStatus.Delivered)
                assignment.DeliveredAt = DateTime.UtcNow;

            await _deliveryRepository.UpdateAsync(assignment);

            if (OrderStatusSync.TryGetValue(dto.Status, out var orderStatus))
            {
                var order = await _orderRepository.GetById(assignment.OrderId);
                if (order != null)
                {
                    order.Status = orderStatus;
                    order.UpdatedAt = DateTime.UtcNow;
                    await _orderRepository.UpdateAsync(order);
                }
            }

            return new DeliveryAssignmentResponseDTO
            {
                Id = assignment.Id,
                OrderId = assignment.OrderId,
                DeliveryAgentId = assignment.DeliveryAgentId,
                Status = assignment.Status,
                DeliveryAddress = assignment.Order?.DeliveryAddress ?? string.Empty,
                TotalAmount = assignment.Order?.TotalAmount ?? 0,
                PickedUpAt = assignment.PickedUpAt,
                DeliveredAt = assignment.DeliveredAt
            };
        }
    }
}
