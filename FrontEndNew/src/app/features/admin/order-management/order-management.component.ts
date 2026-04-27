import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Subject, EMPTY } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';

export interface AdminOrder {
  orderId: string;
  customerId: string;
  customerName: string;
  restaurantName: string;
  totalAmount: number;
  status: any;
  placedAt: Date;
}

@Component({
  selector: 'app-admin-order-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css']
})
export class AdminOrderManagementComponent implements OnInit, OnDestroy {

  searchQuery = '';
  selectedStatus = 'all';
  isLoading = false;
  errorMessage = '';
  
  orders: AdminOrder[] = [];

  statusFilters = ['all', 'Pending', 'Preparing', 'ReadyForPickup', 'OutForDelivery', 'Delivered', 'Cancelled'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    
    this.adminService.getAllOrders().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to load orders', err);
        this.errorMessage = 'Failed to load orders.';
        this.cdr.markForCheck();
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe(data => {
      if (data) {
        this.orders = data;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredOrders(): AdminOrder[] {
    let filtered = this.orders;
    
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(o => this.getStatusLabel(o.status).replace(/\s+/g, '') === this.selectedStatus.replace(/\s+/g, ''));
    }
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        (o.orderId && o.orderId.toLowerCase().includes(query)) || 
        (o.customerName && o.customerName.toLowerCase().includes(query)) ||
        (o.restaurantName && o.restaurantName.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }

  getStatusLabel(status: any): string {
    if (typeof status === 'string') return status;
    const labels: { [key: number]: string } = { 0: 'Pending', 1: 'Preparing', 2: 'Ready', 3: 'Completed', 4: 'Cancelled' };
    return labels[status] || 'Unknown';
  }

  viewOrder(order: AdminOrder): void {
    console.log('View order:', order.orderId);
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
