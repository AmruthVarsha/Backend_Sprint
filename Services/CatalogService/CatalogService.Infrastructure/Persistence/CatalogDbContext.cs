using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using CatalogService.Domain.Entities;

namespace CatalogService.Infrastructure.Persistence
{
    public class CatalogDbContext : DbContext
    {
        public CatalogDbContext(DbContextOptions<CatalogDbContext> options) : base(options) { }

        public DbSet<Restaurant> Restaurants { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<ServiceArea> ServiceAreas { get; set; } // fixed typo: DerviceAreas
        public DbSet<Cuisine> Cuisines { get; set; }
        public DbSet<RestaurantCuisine> RestaurantCuisines { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Restaurant>(entity =>
            {
                entity.HasKey(r => r.Id);

                entity.Property(r => r.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(r => r.Description)
                    .HasMaxLength(300);

                entity.Property(r => r.PhoneNumber)
                    .IsRequired()
                    .HasMaxLength(10);

                entity.Property(r => r.Email)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(r => r.Rating)
                    .HasDefaultValue(0.0);

                entity.Property(r => r.TotalRatings)
                    .HasDefaultValue(0);

                entity.Property(r => r.IsActive)
                    .HasDefaultValue(true);

                entity.Property(r => r.IsApproved)
                    .HasDefaultValue(false);

                entity.Property(r => r.PrepTimeMinutes)
                    .IsRequired();

                entity.HasOne(r => r.Address)
                    .WithOne(a => a.Restaurant)
                    .HasForeignKey<Address>(a => a.RestaurantId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(r => r.ServiceAreas)
                    .WithOne(s => s.Restaurant)
                    .HasForeignKey(s => s.RestaurantId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(r => r.Categories)
                    .WithOne(c => c.Restaurant)
                    .HasForeignKey(c => c.RestaurantId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(r => r.RestaurantCuisines)
                    .WithOne(rc => rc.Restaurant)
                    .HasForeignKey(rc => rc.RestaurantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Address>(entity =>
            {
                entity.HasKey(a => a.Id);

                entity.Property(a => a.Street)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(a => a.City)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(a => a.State)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(a => a.Pincode)
                    .IsRequired()
                    .HasMaxLength(6);
            });

            modelBuilder.Entity<ServiceArea>(entity =>
            {
                entity.HasKey(s => s.Id);

                entity.Property(s => s.Pincode)
                    .IsRequired()
                    .HasMaxLength(6);

                entity.Property(s => s.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.HasIndex(s => new { s.RestaurantId, s.Pincode })
                    .IsUnique();
            });

            modelBuilder.Entity<Cuisine>(entity =>
            {
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Name)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(c => c.IsActive)
                    .HasDefaultValue(true);

                entity.HasIndex(c => c.Name)
                    .IsUnique();
            });

            modelBuilder.Entity<RestaurantCuisine>(entity =>
            {
                entity.HasKey(rc => rc.Id);

                entity.HasIndex(rc => new { rc.RestaurantId, rc.CuisineId })
                    .IsUnique();

                entity.HasOne(rc => rc.Cuisine)
                    .WithMany(c => c.RestaurantCuisines)
                    .HasForeignKey(rc => rc.CuisineId)
                    .OnDelete(DeleteBehavior.Cascade);
            });


            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Name)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(c => c.DisplayOrder)
                    .HasDefaultValue(0);

                entity.Property(c => c.IsActive)
                    .HasDefaultValue(true);

                entity.HasMany(c => c.MenuItems)
                    .WithOne(m => m.Category)
                    .HasForeignKey(m => m.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<MenuItem>(entity =>
            {
                entity.HasKey(m => m.Id);

                entity.Property(m => m.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(m => m.Description)
                    .HasMaxLength(300);

                entity.Property(m => m.Price)
                    .IsRequired()
                    .HasColumnType("decimal(10,2)");

                entity.Property(m => m.IsAvailable)
                    .HasDefaultValue(true);

                entity.Property(m => m.IsVeg)
                    .HasDefaultValue(false);

                entity.HasOne(m => m.Restaurant)
                    .WithMany()
                    .HasForeignKey(m => m.RestaurantId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<Cuisine>().HasData(
            new Cuisine { Id = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000000"), Name = "North Indian", IsActive = true },
            new Cuisine { Id = Guid.Parse("a1b2c3d4-0002-0000-0000-000000000000"), Name = "South Indian", IsActive = true },
            new Cuisine { Id = Guid.Parse("a1b2c3d4-0003-0000-0000-000000000000"), Name = "Chinese", IsActive = true },
            new Cuisine { Id = Guid.Parse("a1b2c3d4-0004-0000-0000-000000000000"), Name = "Italian", IsActive = true },
            new Cuisine { Id = Guid.Parse("a1b2c3d4-0005-0000-0000-000000000000"), Name = "Fast Food", IsActive = true },
            new Cuisine { Id = Guid.Parse("a1b2c3d4-0006-0000-0000-000000000000"), Name = "Biryani", IsActive = true },
            new Cuisine { Id = Guid.Parse("a1b2c3d4-0007-0000-0000-000000000000"), Name = "Desserts", IsActive = true },
            new Cuisine { Id = Guid.Parse("a1b2c3d4-0008-0000-0000-000000000000"), Name = "Beverages", IsActive = true }
            );
        }
    }
}