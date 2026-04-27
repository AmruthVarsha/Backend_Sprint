import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService, AdminDashboardDto } from '../../../core/services/admin.service';
import { Subject, EMPTY } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
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
        this.stats = data;
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Global search:', this.searchQuery);
      // TODO: Implement global search functionality
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
}