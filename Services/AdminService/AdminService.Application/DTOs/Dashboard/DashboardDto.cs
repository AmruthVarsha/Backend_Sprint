namespace AdminService.Application.DTOs.Dashboard
{
    public class DashboardDto
    {
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public int ActiveOrders { get; set; }
        public int CancelledOrders { get; set; }
        public int DeliveredOrders { get; set; }
    }
}
