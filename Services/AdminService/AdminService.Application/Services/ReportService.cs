using AdminService.Application.DTOs.Reports;
using AdminService.Application.Interfaces.Services;
using AdminService.Domain.Interfaces;

namespace AdminService.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IOrderSummaryRepository _orderSummaryRepository;

        public ReportService(IOrderSummaryRepository orderSummaryRepository)
        {
            _orderSummaryRepository = orderSummaryRepository;
        }

        public async Task<SalesReportDto> GetSalesReportAsync(DateTime from, DateTime to)
        {
            var orders = await _orderSummaryRepository.GetByDateRangeAsync(from, to);

            var dailyBreakdown = orders
                .GroupBy(o => o.PlacedAt.Date)
                .Select(g => new DailySalesDto
                {
                    Date = g.Key,
                    Orders = g.Count(),
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(d => d.Date)
                .ToList();

            var report = new SalesReportDto
            {
                FromDate = from,
                ToDate = to,
                TotalOrders = orders.Count,
                TotalRevenue = orders.Sum(o => o.TotalAmount),
                DeliveredOrders = orders.Count(o => o.Status == Domain.Enums.OrderStatus.Delivered),
                CancelledOrders = orders.Count(o => o.Status == Domain.Enums.OrderStatus.CancelledByCustomer),
                DailyBreakdown = dailyBreakdown
            };

            return report;
        }
    }
}
