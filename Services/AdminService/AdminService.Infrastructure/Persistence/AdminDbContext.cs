using Microsoft.EntityFrameworkCore;
using AdminService.Domain.Entities;

namespace AdminService.Infrastructure.Persistence
{
    public class AdminDbContext : DbContext
    {
        public AdminDbContext(DbContextOptions<AdminDbContext> options) : base(options)
        {
        }

        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<OrderSummary> OrderSummaries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.OrderId).IsRequired();
                entity.Property(e => e.PerformedByAdminId).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Action).HasMaxLength(500).IsRequired();
                entity.Property(e => e.Reason).HasMaxLength(1000);
                entity.Property(e => e.PerformedAt).IsRequired();

                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.PerformedAt);
            });

            modelBuilder.Entity<OrderSummary>(entity =>
            {
                entity.ToTable("OrderSummaries");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.OrderId).IsRequired();
                entity.Property(e => e.CustomerId).HasMaxLength(255).IsRequired();
                entity.Property(e => e.RestaurantName).HasMaxLength(255).IsRequired();
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
                entity.Property(e => e.PlacedAt).IsRequired();
                entity.Property(e => e.LastUpdatedAt).IsRequired();

                entity.HasIndex(e => e.OrderId).IsUnique();
                entity.HasIndex(e => e.CustomerId);
                entity.HasIndex(e => e.PlacedAt);
            });
        }
    }
}
