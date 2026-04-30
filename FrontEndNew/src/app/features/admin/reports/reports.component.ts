import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminDashboardDto } from '../../../core/services/admin.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminSidebarComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class AdminReportsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('revenueCategoryChart') revenueCategoryChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('orderVolumeChart') orderVolumeChartCanvas!: ElementRef<HTMLCanvasElement>;

  revenueCategoryChart?: Chart;
  orderVolumeChart?: Chart;

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

  isLoading = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadReportData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStats(): void {
    this.adminService.getDashboardStats().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      if (data) {
        this.stats = data;
        this.cdr.markForCheck();
      }
    });
  }

  loadReportData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Fetch last 30 days of data
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);

    const fromStr = from.toISOString();
    const toStr = to.toISOString();

    // Fetch both reports
    this.adminService.getSalesReport(fromStr, toStr).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (salesReport) => {
        this.initOrderVolumeChart(salesReport.dailyBreakdown);
      },
      error: (err) => {
        console.error('Failed to load sales report', err);
        this.initOrderVolumeChart([]);
      }
    });

    this.adminService.getUserReport(fromStr, toStr).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (userReport) => {
        this.initUserSegmentationChart(userReport.usersByRole);
      },
      error: (err) => {
        console.error('Failed to load user report', err);
        this.initUserSegmentationChart({});
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  ngAfterViewInit(): void {}

  initUserSegmentationChart(usersByRole: any): void {
    if (!this.revenueCategoryChartCanvas) return;
    if (this.revenueCategoryChart) this.revenueCategoryChart.destroy();
    
    const ctx = this.revenueCategoryChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = Object.keys(usersByRole || {});
    const data = Object.values(usersByRole || {}) as number[];

    // Fallback if no data
    if (labels.length === 0) {
      labels.push('No Data');
      data.push(0);
    }

    this.revenueCategoryChart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#ff6b35', '#3b82f6', '#10b981', '#f59e0b', '#6366f1']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { usePointStyle: true } }
        }
      }
    });
  }

  initOrderVolumeChart(dailyBreakdown: any[]): void {
    if (!this.orderVolumeChartCanvas) return;
    if (this.orderVolumeChart) this.orderVolumeChart.destroy();
    
    const ctx = this.orderVolumeChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const sortedData = (dailyBreakdown || [])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    const labels = sortedData.map(d => new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }));
    const data = sortedData.map(d => d.orders) as number[];

    // Fallback if no data
    if (labels.length === 0) {
      labels.push('N/A');
      data.push(0);
    }

    this.orderVolumeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Orders',
          data: data,
          fill: true,
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          borderColor: '#ff6b35',
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
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            ticks: { stepSize: 1 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: { 
            grid: { display: false } 
          }
        }
      }
    });
  }
}