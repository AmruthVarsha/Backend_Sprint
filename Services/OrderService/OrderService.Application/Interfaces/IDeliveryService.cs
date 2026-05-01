using OrderService.Application.DTOs.Delivery;

namespace OrderService.Application.Interfaces
{
    public interface IDeliveryService
    {
        Task<IEnumerable<DeliveryOrderResponseDTO>> GetAssignmentsAsync(string agentId);
        Task<DeliveryOrderResponseDTO> UpdateDeliveryStatusAsync(Guid assignmentId, string agentId, UpdateDeliveryStatusDTO dto);
        Task<DeliveryOrderResponseDTO> UpdateDeliveryPaymentStatusAsync(Guid assignmentId, string agentId, UpdatePaymentStatusDTO dto);
    }
}
