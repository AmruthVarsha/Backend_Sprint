using AdminService.Application.DTOs.Dashboard;

namespace AdminService.Application.Interfaces.Services
{
    public interface IDashboardService
    {
        Task<DashboardDto> GetDashboardAsync();
    }
}
