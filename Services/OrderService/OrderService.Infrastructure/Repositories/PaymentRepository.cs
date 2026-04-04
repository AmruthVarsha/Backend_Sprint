using Microsoft.EntityFrameworkCore;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;
using OrderService.Infrastructure.Persistence;

namespace OrderService.Infrastructure.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly OrderDbContext _context;

        public PaymentRepository(OrderDbContext context)
        {
            _context = context;
        }

        public async Task<Payment?> GetById(Guid id)
        {
            return await _context.Payments.FindAsync(id);
        }

        public async Task<Payment?> GetByOrderId(Guid orderId)
        {
            return await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId);
        }

        public async Task<IEnumerable<Payment>> GetAll()
        {
            return await _context.Payments.ToListAsync();
        }

        public async Task AddAsync(Payment payment)
        {
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Payment payment)
        {
            _context.Payments.Update(payment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null) return;
            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();
        }
    }
}
