import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderResponseDTO } from '../../../shared/models/order.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  orders: OrderResponseDTO[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        // Sort newest first
        this.orders = orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load your orders. Please try again.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  viewOrder(orderId: string): void {
    this.router.navigate(['/customer/order-tracking', orderId]);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Placed':              'bg-surface-container text-on-surface-variant border-surface-variant',
      'Paid':                'bg-secondary-container text-on-secondary-container border-secondary/20',
      'InProgress':          'bg-tertiary-container text-on-tertiary-container border-tertiary/20',
      'OutForDelivery':      'bg-primary-container text-on-primary-container border-primary/20',
      'Delivered':           'bg-secondary-container text-on-secondary-container border-secondary/20',
      'CancelledByCustomer': 'bg-error-container text-on-error-container border-error/20',
      'CancelledBySystem':   'bg-error-container text-on-error-container border-error/20',
    };
    return map[status] ?? 'bg-surface-container text-on-surface-variant border-surface-variant';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'Placed':              'Placed',
      'Paid':                'Paid',
      'InProgress':          'In Progress',
      'OutForDelivery':      'Out for Delivery',
      'Delivered':           'Delivered',
      'CancelledByCustomer': 'Cancelled',
      'CancelledBySystem':   'Cancelled',
    };
    return map[status] ?? status;
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      'Placed':              'receipt',
      'Paid':                'payments',
      'InProgress':          'restaurant',
      'OutForDelivery':      'delivery_dining',
      'Delivered':           'check_circle',
      'CancelledByCustomer': 'cancel',
      'CancelledBySystem':   'cancel',
    };
    return map[status] ?? 'info';
  }

  isActiveOrder(status: string): boolean {
    return ['Placed', 'Paid', 'InProgress', 'OutForDelivery'].includes(status);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
