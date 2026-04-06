using AdminService.Application.DTOs.Dashboard;
using AdminService.Application.Interfaces.Services;
using AdminService.Domain.Interfaces;

namespace AdminService.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IOrderSummaryRepository _orderSummaryRepository;

        public DashboardService(IOrderSummaryRepository orderSummaryRepository)
        {
            _orderSummaryRepository = orderSummaryRepository;
        }

        public async Task<DashboardDto> GetDashboardAsync()
        {
            var allOrders = await _orderSummaryRepository.GetAllAsync();

            var dashboard = new DashboardDto
            {
                TotalOrders = allOrders.Count,
                TotalRevenue = allOrders.Sum(o => o.TotalAmount),
                ActiveOrders = allOrders.Count(o => o.Status != Domain.Enums.OrderStatus.Delivered && o.Status != Domain.Enums.OrderStatus.CancelledByCustomer),
                CancelledOrders = allOrders.Count(o => o.Status == Domain.Enums.OrderStatus.CancelledByCustomer),
                DeliveredOrders = allOrders.Count(o => o.Status == Domain.Enums.OrderStatus.Delivered)
            };

            return dashboard;
        }
    }
}
