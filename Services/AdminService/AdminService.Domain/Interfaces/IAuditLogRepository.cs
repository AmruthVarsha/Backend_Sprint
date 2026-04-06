using AdminService.Domain.Entities;

namespace AdminService.Domain.Interfaces
{
    public interface IAuditLogRepository
    {
        Task AddAsync(AuditLog log);
    }
}
