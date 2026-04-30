import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
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
  paymentMethod: string;
  paymentStatus: string;
  placedAt: Date;
}

// Must match the UpdateOrderStatusDto on the backend (enum values)
export const ORDER_STATUS_OPTIONS = [
  { label: 'Pending',          value: 0 },
  { label: 'Preparing',        value: 1 },
  { label: 'Ready for Pickup', value: 2 },
  { label: 'Out for Delivery', value: 3 },
  { label: 'Delivered',        value: 4 },
  { label: 'Cancelled',        value: 5 },
];


@Component({
  selector: 'app-admin-order-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminSidebarComponent],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css']
})
export class AdminOrderManagementComponent implements OnInit, OnDestroy {

  searchQuery = '';
  selectedStatus = 'all';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  orders: AdminOrder[] = [];

  statusFilters = ['all', 'Pending', 'Preparing', 'ReadyForPickup', 'OutForDelivery', 'Delivered', 'Cancelled'];
  statusOptions = ORDER_STATUS_OPTIONS;

  // Status update modal state
  showStatusModal = false;
  updatingOrder: AdminOrder | null = null;
  selectedNewStatus: number = 0;
  updateReason: string = '';
  isUpdatingStatus = false;
  statusUpdateError = '';

  // Track which order rows are in-flight
  updatingOrderId: string | null = null;

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
    const labels: { [key: number]: string } = {
      0: 'Pending', 1: 'Preparing', 2: 'Ready for Pickup',
      3: 'Out for Delivery', 4: 'Delivered', 5: 'Cancelled'
    };
    return labels[status] ?? 'Unknown';
  }

  getStatusValue(status: any): number {
    if (typeof status === 'number') return status;
    const map: { [key: string]: number } = {
      'Pending': 0, 'Preparing': 1, 'Ready for Pickup': 2,
      'Out for Delivery': 3, 'Delivered': 4, 'Cancelled': 5
    };
    return map[status] ?? 0;
  }

  getStatusColorClasses(status: any): string {
    const label = this.getStatusLabel(status);
    if (label === 'Delivered') return 'border-emerald-200 text-emerald-700 bg-emerald-50';
    if (label === 'Pending') return 'border-yellow-200 text-yellow-700 bg-yellow-50';
    if (label === 'Preparing') return 'border-blue-200 text-blue-700 bg-blue-50';
    if (label === 'Cancelled') return 'border-red-200 text-red-700 bg-red-50';
    return 'border-gray-200 text-gray-700 bg-gray-50';
  }

  // ── STATUS UPDATE MODAL ────────────────────────────────────────────────────
  openStatusModal(order: AdminOrder): void {
    this.updatingOrder = order;
    this.selectedNewStatus = this.getStatusValue(order.status);
    this.updateReason = '';
    this.statusUpdateError = '';
    this.showStatusModal = true;
    this.cdr.markForCheck();
  }

  cancelStatusUpdate(): void {
    this.showStatusModal = false;
    this.updatingOrder = null;
    this.updateReason = '';
    this.statusUpdateError = '';
    this.cdr.markForCheck();
  }

  saveStatusUpdate(): void {
    if (!this.updatingOrder) return;
    if (this.updateReason.length < 5) {
      this.statusUpdateError = 'Reason must be at least 5 characters long.';
      return;
    }

    this.isUpdatingStatus = true;
    this.statusUpdateError = '';
    this.updatingOrderId = this.updatingOrder.orderId;

    const updateDto = {
      newStatus: Number(this.selectedNewStatus),
      reason: this.updateReason
    };

    this.adminService.updateOrderStatus(this.updatingOrder.orderId, updateDto).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to update order status', err);
        this.statusUpdateError = err?.error?.message || 'Failed to update status. Please try again.';
        this.cdr.markForCheck();
        return EMPTY;
      }),
      finalize(() => {
        this.isUpdatingStatus = false;
        this.updatingOrderId = null;
        this.cdr.markForCheck();
      })
    ).subscribe(() => {
      const idx = this.orders.findIndex(o => o.orderId === this.updatingOrder!.orderId);
      if (idx !== -1) {
        this.orders[idx] = { ...this.orders[idx], status: this.selectedNewStatus };
      }
      this.successMessage = `Order status updated to "${this.getStatusLabel(this.selectedNewStatus)}".`;
      this.showStatusModal = false;
      this.updatingOrder = null;
      this.updateReason = '';
      this.cdr.markForCheck();
      setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}