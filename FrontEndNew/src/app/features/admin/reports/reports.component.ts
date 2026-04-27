import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminDashboardDto } from '../../../core/services/admin.service';
import { Subject, EMPTY } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class AdminReportsComponent implements OnInit, OnDestroy {

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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    
    this.adminService.getDashboardStats().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to load stats', err);
        this.errorMessage = 'Failed to load stats.';
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

  exportReport(type: string): void {
    console.log('Export report:', type);
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}