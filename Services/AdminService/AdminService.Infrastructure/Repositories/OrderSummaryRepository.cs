using AdminService.Domain.Entities;
using AdminService.Domain.Enums;
using AdminService.Domain.Interfaces;
using AdminService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdminService.Infrastructure.Repositories
{
    public class OrderSummaryRepository : IOrderSummaryRepository
    {
        private readonly AdminDbContext _context;

        public OrderSummaryRepository(AdminDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(OrderSummary orderSummary)
        {
            await _context.OrderSummaries.AddAsync(orderSummary);
            await _context.SaveChangesAsync();
        }

        public async Task<List<OrderSummary>> GetAllAsync()
        {
            return await _context.OrderSummaries.ToListAsync();
        }

        public async Task<OrderSummary?> GetByOrderIdAsync(Guid orderId)
        {
            return await _context.OrderSummaries.FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        public async Task<List<OrderSummary>> GetByDateRangeAsync(DateTime from, DateTime to)
        {
            return await _context.OrderSummaries
                .Where(o => o.PlacedAt >= from && o.PlacedAt <= to)
                .ToListAsync();
        }

        public async Task UpdateStatusAsync(Guid orderId, OrderStatus newStatus, DateTime updatedAt)
        {
            var order = await _context.OrderSummaries.FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order != null)
            {
                order.Status = newStatus;
                order.LastUpdatedAt = updatedAt;
                _context.OrderSummaries.Update(order);
                await _context.SaveChangesAsync();
            }
        }
    }
}
