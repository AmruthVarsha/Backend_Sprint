using OrderService.Application.DTOs.Delivery;

namespace OrderService.Application.Interfaces
{
    public interface IDeliveryService
    {
        Task<IEnumerable<DeliveryAssignmentResponseDTO>> GetAssignmentsAsync(string agentId);
        Task<DeliveryAssignmentResponseDTO> UpdateDeliveryStatusAsync(Guid id, string agentId, UpdateDeliveryStatusDTO dto);
    }
}
