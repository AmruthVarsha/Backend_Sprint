using Microsoft.EntityFrameworkCore;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;
using OrderService.Infrastructure.Persistence;

namespace OrderService.Infrastructure.Repositories
{
    public class DeliveryAssignmentRepository : IDeliveryAssignmentRepository
    {
        private readonly OrderDbContext _context;

        public DeliveryAssignmentRepository(OrderDbContext context)
        {
            _context = context;
        }

        public async Task<DeliveryAssignment?> GetById(Guid id)
        {
            return await _context.DeliveryAssignments
                .Include(d => d.Order)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<IEnumerable<DeliveryAssignment>> GetByAgentId(string agentId)
        {
            return await _context.DeliveryAssignments
                .Include(d => d.Order)
                .Where(d => d.DeliveryAgentId == agentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<DeliveryAssignment>> GetAll()
        {
            return await _context.DeliveryAssignments.ToListAsync();
        }

        public async Task AddAsync(DeliveryAssignment deliveryAssignment)
        {
            _context.DeliveryAssignments.Add(deliveryAssignment);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(DeliveryAssignment deliveryAssignment)
        {
            _context.DeliveryAssignments.Update(deliveryAssignment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var assignment = await _context.DeliveryAssignments.FindAsync(id);
            if (assignment == null) return;
            _context.DeliveryAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
        }
    }
}
