using OrderService.Domain.Entities;

namespace OrderService.Domain.Interfaces
{
    public interface IPaymentRepository
    {
        Task<Payment?> GetById(Guid id);
        Task<Payment?> GetByOrderId(Guid orderId);
        Task<IEnumerable<Payment>> GetAll();
        Task AddAsync(Payment payment);
        Task UpdateAsync(Payment payment);
        Task DeleteAsync(Guid id);
    }
}
