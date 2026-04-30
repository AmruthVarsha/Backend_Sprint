import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrderService } from '../../../core/services/order.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import {
  OrderResponseDTO,
  RestaurantOrderSummaryDTO,
  OrderStatus,
  RestaurantOrderStatus,
  CancelOrderDTO
} from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css']
})
export class OrderTrackingComponent implements OnInit, OnDestroy {

  order: OrderResponseDTO | null = null;
  isLoading = true;
  errorMessage = '';
  isCancelling = false;
  cancelErrorMessage = '';
  showCancelConfirm = false;

  private orderId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.orderId) {
      this.loadOrder();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrder(): void {
    this.isLoading = true;
    this.orderService.getOrderById(this.orderId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load order details.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get canCancel(): boolean {
    if (!this.order) return false;
    const isEarlyEnough = (Date.now() - new Date(this.order.createdAt).getTime()) < 10 * 60 * 1000;
    const allPending = this.order.restaurantOrders.every(
      ro => ro.status === RestaurantOrderStatus.Pending
    );
    return isEarlyEnough && allPending && !this.isCancelling;
  }

  cancelOrder(): void {
    if (!this.order || !this.canCancel) return;
    this.isCancelling = true;
    this.cancelErrorMessage = '';
    const dto: CancelOrderDTO = { cancellationReason: 'Cancelled by customer.' };
    this.orderService.cancelOrder(this.order.id, dto).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showCancelConfirm = false;
        this.loadOrder(); // refresh status
      },
      error: (err) => {
        this.cancelErrorMessage = err?.error?.message || 'Failed to cancel order.';
        this.isCancelling = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Overall order status steps for the progress bar */
  readonly orderSteps = [
    { label: 'Order Placed', status: OrderStatus.Placed },
    { label: 'In Progress', status: OrderStatus.InProgress },
    { label: 'Out for Delivery', status: OrderStatus.OutForDelivery },
    { label: 'Delivered', status: OrderStatus.Delivered }
  ];

  readonly statusOrder = [
    OrderStatus.Placed,
    OrderStatus.InProgress,
    OrderStatus.OutForDelivery,
    OrderStatus.Delivered
  ];

  isStepCompleted(stepStatus: OrderStatus): boolean {
    const orderIdx = this.statusOrder.indexOf(this.order?.status as OrderStatus);
    const stepIdx = this.statusOrder.indexOf(stepStatus);
    return orderIdx >= stepIdx;
  }

  /** Per-restaurant status colour */
  getSubStatusClass(status: string): string {
    const map: Record<string, string> = {
      [RestaurantOrderStatus.Pending]:       'bg-surface-container text-on-surface-variant border-surface-variant',
      [RestaurantOrderStatus.Accepted]:      'bg-secondary-container text-on-secondary-container border-secondary/20',
      [RestaurantOrderStatus.Preparing]:     'bg-tertiary-container text-on-tertiary-container border-tertiary/20',
      [RestaurantOrderStatus.ReadyForPickup]:'bg-primary-container text-on-primary-container border-primary/20',
      [RestaurantOrderStatus.PickedUp]:      'bg-secondary-container text-on-secondary-container border-secondary/20',
      [RestaurantOrderStatus.Cancelled]:     'bg-error-container text-on-error-container border-error/20',
      [RestaurantOrderStatus.Rejected]:      'bg-error-container text-on-error-container border-error/20',
    };
    return map[status] ?? 'bg-surface-container text-on-surface-variant border-surface-variant';
  }

  getSubStatusIcon(status: string): string {
    const map: Record<string, string> = {
      [RestaurantOrderStatus.Pending]:       'schedule',
      [RestaurantOrderStatus.Accepted]:      'thumb_up',
      [RestaurantOrderStatus.Preparing]:     'cooking',
      [RestaurantOrderStatus.ReadyForPickup]:'inventory_2',
      [RestaurantOrderStatus.PickedUp]:      'directions_bike',
      [RestaurantOrderStatus.Cancelled]:     'cancel',
      [RestaurantOrderStatus.Rejected]:      'cancel',
    };
    return map[status] ?? 'schedule';
  }

  getOverallStatusLabel(status: string): string {
    const map: Record<string, string> = {
      [OrderStatus.Placed]:              '🕐 Waiting for restaurants',
      [OrderStatus.InProgress]:          '👨‍🍳 Restaurants are preparing',
      [OrderStatus.OutForDelivery]:      '🛵 Out for delivery',
      [OrderStatus.Delivered]:           '✅ Delivered',
      [OrderStatus.CancelledByCustomer]: '❌ Cancelled by you',
      [OrderStatus.CancelledBySystem]:   '❌ Cancelled',
    };
    return map[status] ?? status;
  }
}
