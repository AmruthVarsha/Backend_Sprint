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
        private readonly IDeliveryAgentProfileRepository _agentProfileRepository;
        private readonly IRestaurantOrderRepository _restaurantOrderRepository;
        private readonly IOrderStatusPublisher _orderStatusPublisher;
        private readonly IPaymentRepository _paymentRepository;

        public DeliveryService(
            IDeliveryAssignmentRepository deliveryRepository,
            IOrderRepository orderRepository,
            IDeliveryAgentProfileRepository agentProfileRepository,
            IRestaurantOrderRepository restaurantOrderRepository,
            IOrderStatusPublisher orderStatusPublisher,
            IPaymentRepository paymentRepository)
        {
            _deliveryRepository = deliveryRepository;
            _orderRepository = orderRepository;
            _agentProfileRepository = agentProfileRepository;
            _restaurantOrderRepository = restaurantOrderRepository;
            _orderStatusPublisher = orderStatusPublisher;
            _paymentRepository = paymentRepository;
        }

        public async Task<IEnumerable<DeliveryOrderResponseDTO>> GetAssignmentsAsync(string agentId)
        {
            var assignments = await _deliveryRepository.GetByAgentId(agentId);
            
            return assignments
                .Where(a => a.Order != null)
                .OrderBy(a => (int)a.Status)
                .ThenByDescending(a => a.Status == DeliveryStatus.Delivered ? (a.DeliveredAt ?? DateTime.MinValue) : a.Order!.CreatedAt)
                .Select(assignment => MapToDeliveryResponse(assignment.Order!, assignment, assignment.Order!.Payment));
        }

        public async Task<DeliveryOrderResponseDTO> UpdateDeliveryStatusAsync(
            Guid assignmentId, string agentId, UpdateDeliveryStatusDTO dto)
        {
            var assignment = await _deliveryRepository.GetById(assignmentId);
            if (assignment == null)
                throw new NotFoundException("DeliveryAssignment", assignmentId);

            if (assignment.DeliveryAgentId != agentId)
                throw new ForbiddenException("You are not assigned to this delivery.");

            if (!IsValidTransition(assignment.Status, dto.Status))
                throw new BadRequestException($"Cannot transition from '{assignment.Status}' to '{dto.Status}'.");

            assignment.Status = dto.Status;
            UpdateTimestamps(assignment, dto.Status);
            await _deliveryRepository.UpdateAsync(assignment);

            await SyncOrderStatusAsync(assignment.OrderId, dto.Status);

            var updatedOrder = await _orderRepository.GetByIdWithDetails(assignment.OrderId);
            var payment = await _paymentRepository.GetByOrderId(assignment.OrderId);
            if (updatedOrder != null)
            {
                await _orderStatusPublisher.PublishOrderStatus(
                    updatedOrder.Id, updatedOrder.CustomerId,
                    string.Join(", ", updatedOrder.RestaurantOrders.Select(ro => ro.RestaurantName)),
                    updatedOrder.TotalAmount, updatedOrder.Status.ToString(), updatedOrder.CreatedAt,
                    payment?.Method.ToString() ?? "Unknown", payment?.Status.ToString() ?? "Unknown");
            }

            if (dto.Status == DeliveryStatus.Delivered)
            {
                var agentProfile = await _agentProfileRepository.GetByAgentUserId(agentId);
                if (agentProfile != null)
                {
                    agentProfile.IsActive = true;
                    agentProfile.LastUpdated = DateTime.UtcNow;
                    await _agentProfileRepository.UpdateAsync(agentProfile);
                }
            }

            return MapToDeliveryResponse(updatedOrder!, assignment, payment);
        }

        public async Task<DeliveryOrderResponseDTO> UpdateDeliveryPaymentStatusAsync(Guid assignmentId, string agentId, UpdatePaymentStatusDTO dto)
        {
            var assignment = await _deliveryRepository.GetById(assignmentId);
            if (assignment == null) throw new NotFoundException("DeliveryAssignment", assignmentId);
            if (assignment.DeliveryAgentId != agentId) throw new ForbiddenException("You are not assigned to this delivery.");

            var payment = await _paymentRepository.GetByOrderId(assignment.OrderId);
            if (payment == null) throw new NotFoundException("Payment", assignment.OrderId);

            payment.Status = dto.Status;
            payment.UpdatedAt = DateTime.UtcNow;
            await _paymentRepository.UpdateAsync(payment);

            var updatedOrder = await _orderRepository.GetByIdWithDetails(assignment.OrderId);
            if (updatedOrder != null)
            {
                await _orderStatusPublisher.PublishOrderStatus(
                    updatedOrder.Id, updatedOrder.CustomerId,
                    string.Join(", ", updatedOrder.RestaurantOrders.Select(ro => ro.RestaurantName)),
                    updatedOrder.TotalAmount, updatedOrder.Status.ToString(), updatedOrder.CreatedAt,
                    payment.Method.ToString(), payment.Status.ToString());
            }

            return MapToDeliveryResponse(updatedOrder!, assignment, payment);
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

        private static void UpdateTimestamps(Domain.Entities.DeliveryAssignment assignment, DeliveryStatus status)
        {
            if (status == DeliveryStatus.PickedUp) assignment.PickedUpAt = DateTime.UtcNow;
            else if (status == DeliveryStatus.Delivered) assignment.DeliveredAt = DateTime.UtcNow;
        }

        private async Task SyncOrderStatusAsync(Guid orderId, DeliveryStatus deliveryStatus)
        {
            var order = await _orderRepository.GetByIdWithDetails(orderId);
            if (order == null) return;

            var newStatus = deliveryStatus switch
            {
                DeliveryStatus.PickedUp => OrderStatus.OutForDelivery,
                DeliveryStatus.Delivered => OrderStatus.Delivered,
                _ => order.Status
            };

            if (newStatus != order.Status)
            {
                order.Status = newStatus;
                order.UpdatedAt = DateTime.UtcNow;
                await _orderRepository.UpdateAsync(order);
            }

            if (deliveryStatus == DeliveryStatus.PickedUp)
            {
                foreach (var ro in order.RestaurantOrders)
                {
                    if (ro.Status == RestaurantOrderStatus.ReadyForPickup)
                    {
                        ro.Status = RestaurantOrderStatus.PickedUp;
                        ro.UpdatedAt = DateTime.UtcNow;
                        await _restaurantOrderRepository.UpdateAsync(ro);
                    }
                }
            }
            else if (deliveryStatus == DeliveryStatus.Delivered)
            {
                foreach (var ro in order.RestaurantOrders)
                {
                    if (ro.Status != RestaurantOrderStatus.Cancelled && ro.Status != RestaurantOrderStatus.Rejected)
                    {
                        ro.Status = RestaurantOrderStatus.Delivered;
                        ro.UpdatedAt = DateTime.UtcNow;
                        await _restaurantOrderRepository.UpdateAsync(ro);
                    }
                }
            }
        }

        private static DeliveryOrderResponseDTO MapToDeliveryResponse(
            Domain.Entities.Order order,
            Domain.Entities.DeliveryAssignment assignment,
            Domain.Entities.Payment? payment)
        {
            return new DeliveryOrderResponseDTO
            {
                OrderId = order.Id,
                CustomerName = order.CustomerName,
                OverallStatus = order.Status.ToString(),
                TotalAmount = order.TotalAmount,
                PaymentMethod = payment?.Method.ToString() ?? string.Empty,
                PaymentStatus = payment?.Status.ToString() ?? string.Empty,
                DropoffStreet = order.Street,
                DropoffCity = order.City,
                DropoffState = order.State,
                DropoffPincode = order.Pincode,
                DeliveryInstructions = order.DeliveryInstructions,
                AssignmentId = assignment.Id,
                AssignmentStatus = assignment.Status.ToString(),
                PickedUpAt = assignment.PickedUpAt,
                DeliveredAt = assignment.DeliveredAt,
                CreatedAt = order.CreatedAt,
                RestaurantStops = order.RestaurantOrders.Select(ro => new DeliveryRestaurantStopDTO
                {
                    SubOrderId = ro.Id,
                    RestaurantName = ro.RestaurantName,
                    RestaurantAddress = ro.RestaurantAddress,
                    SubOrderStatus = ro.Status.ToString(),
                    SubTotal = ro.SubTotal,
                    Items = ro.OrderItems.Select(oi => new DeliveryItemDTO
                    {
                        MenuItemName = oi.MenuItemName,
                        Quantity = oi.Quantity
                    }).ToList()
                }).ToList()
            };
        }
    }
}
