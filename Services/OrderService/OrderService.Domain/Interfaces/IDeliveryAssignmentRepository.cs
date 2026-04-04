using OrderService.Domain.Entities;

namespace OrderService.Domain.Interfaces
{
    public interface IDeliveryAssignmentRepository
    {
        Task<DeliveryAssignment?> GetById(Guid id);
        Task<IEnumerable<DeliveryAssignment>> GetByAgentId(string agentId);
        Task<IEnumerable<DeliveryAssignment>> GetAll();
        Task AddAsync(DeliveryAssignment deliveryAssignment);
        Task UpdateAsync(DeliveryAssignment deliveryAssignment);
        Task DeleteAsync(Guid id);
    }
}
