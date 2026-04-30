import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

import { AdminService, AdminDashboardDto } from '../../../core/services/admin.service';
import { Subject, EMPTY } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminSidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('orderChart') orderChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart') revenueChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('userChart') userChartCanvas!: ElementRef<HTMLCanvasElement>;

  orderChart?: Chart;
  revenueChart?: Chart;
  userChart?: Chart;

  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  
  stats: AdminDashboardDto = {
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    cancelledOrders: 0,
    deliveredOrders: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalRestaurants: 0,
    activeRestaurants: 0,
    pendingUserApprovals: 0,
    pendingRestaurantApprovals: 0
  };

  private destroy$ = new Subject<void>();
  
  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    
    this.adminService.getDashboardStats().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to load dashboard stats', err);
        this.errorMessage = 'Failed to load real-time dashboard data.';
        this.cdr.markForCheck();
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe(data => {
      if (data) {
        console.log('Dashboard Data Received:', data);
        this.stats = data;
        this.cdr.markForCheck();
        // Delay chart update to ensure DOM is ready
        setTimeout(() => {
          this.updateCharts();
        }, 100);
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Global search:', this.searchQuery);
    }
  }

  navigateToPendingApprovals(): void {
    this.router.navigate(['/admin/pending-approvals']);
  }

  navigateToUserManagement(): void {
    this.router.navigate(['/admin/user-management']);
  }

  navigateToRestaurantManagement(): void {
    this.router.navigate(['/admin/restaurant-management']);
  }

  navigateToOrderManagement(): void {
    this.router.navigate(['/admin/order-management']);
  }

  navigateToReports(): void {
    this.router.navigate(['/admin/reports']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  logout(): void { 
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/auth/login']);
      }
    });
  }
  ngAfterViewInit(): void {
    if (this.stats.totalUsers > 0 || this.stats.totalOrders > 0) {
      this.updateCharts();
    }
  }

  updateCharts(): void {
    if (this.isLoading) return;
    setTimeout(() => {
      this.initOrderChart();
      this.initRevenueChart();
      this.initUserChart();
    }, 0);
  }

  initOrderChart(): void {
    if (!this.orderChartCanvas) return;
    if (this.orderChart) this.orderChart.destroy();
    const ctx = this.orderChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    this.orderChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Delivered', 'Active', 'Cancelled'],
        datasets: [{
          data: [this.stats.deliveredOrders, this.stats.activeOrders, this.stats.cancelledOrders],
          backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, padding: 20, font: { family: "'Inter', sans-serif", size: 12 } }
          }
        },
        cutout: '70%'
      }
    });
  }

  initRevenueChart(): void {
    if (!this.revenueChartCanvas) return;
    if (this.revenueChart) this.revenueChart.destroy();
    const ctx = this.revenueChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    // Mock variation based on total revenue if no time-series data exists
    const base = this.stats.totalRevenue;
    const data = [base * 0.1, base * 0.15, base * 0.12, base * 0.2, base * 0.18, base * 0.25];
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(255, 107, 53, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 107, 53, 0)');
    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue',
          data: data,
          borderColor: '#ff6b35',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#ff6b35',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  initUserChart(): void {
    if (!this.userChartCanvas) return;
    if (this.userChart) this.userChart.destroy();
    const ctx = this.userChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    this.userChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Users', 'Active Users'],
        datasets: [{
          label: 'Users',
          data: [this.stats.totalUsers, this.stats.activeUsers],
          backgroundColor: ['#6366f1', '#8b5cf6'],
          borderRadius: 8,
          barThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}