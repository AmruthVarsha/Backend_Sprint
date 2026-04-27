import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PartnerService, Order, OrderItem, Restaurant } from '../../../core/services/partner.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

interface OrderFilter {
  label: string;
  value: string;
  count: number;
}

interface OrderStage {
  label: string;
  value: number;
}

@Component({
  selector: 'app-partner-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class PartnerOrdersComponent implements OnInit, OnDestroy {

  isLoading = false;
  errorMessage = '';
  restaurantName = '';
  selectedFilter = 'all';
  showRestaurantDropdown = false;

  restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  orders: Order[] = [];

  orderFilters: OrderFilter[] = [
    { label: 'All Orders', value: 'all', count: 0 },
    { label: 'Pending', value: 'pending', count: 0 },
    { label: 'Preparing', value: 'preparing', count: 0 },
    { label: 'Ready', value: 'ready', count: 0 },
    { label: 'Completed', value: 'completed', count: 0 }
  ];

  orderStages: OrderStage[] = [
    { label: 'Placed', value: 0 },
    { label: 'Preparing', value: 1 },
    { label: 'Ready', value: 2 },
    { label: 'Picked Up', value: 3 }
  ];

  avgPrepTime = '12m 40s';
  todayRating = 4.9;
  todayEarnings = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private partnerService: PartnerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.partnerService.getMyRestaurants().pipe(takeUntil(this.destroy$)).subscribe({
      next: (list) => { this.restaurants = list; this.cdr.markForCheck(); },
      error: () => { this.errorMessage = 'Failed to load restaurants.'; this.cdr.markForCheck(); }
    });

    this.partnerService.selectedRestaurant$.pipe(
      takeUntil(this.destroy$),
      filter(r => r !== null)
    ).subscribe(restaurant => {
      this.selectedRestaurant = restaurant;
      this.restaurantName = restaurant!.name;
      this.cdr.markForCheck();
      this.loadOrders(restaurant!.id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.partnerService.setSelectedRestaurant(restaurant);
    this.showRestaurantDropdown = false;
    this.cdr.markForCheck();
  }

  loadOrders(restaurantId?: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.partnerService.getRestaurantOrders().subscribe({
      next: (orders) => {
        // Filter for the selected restaurant if restaurantId provided
        this.orders = restaurantId
          ? orders.filter(o => o.restaurantId === restaurantId)
          : orders;
        this.updateFilterCounts();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Failed to load orders. Please try again.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  updateFilterCounts(): void {
    this.orderFilters[0].count = this.orders.length; // All
    this.orderFilters[1].count = this.orders.filter(o => o.status === 0).length; // Pending
    this.orderFilters[2].count = this.orders.filter(o => o.status === 1).length; // Preparing
    this.orderFilters[3].count = this.orders.filter(o => o.status === 2).length; // Ready
    this.orderFilters[4].count = this.orders.filter(o => o.status === 3).length; // Completed
  }

  get filteredOrders(): Order[] {
    if (this.selectedFilter === 'all') {
      return this.orders;
    }
    
    const statusMap: { [key: string]: number } = {
      'pending': 0,
      'preparing': 1,
      'ready': 2,
      'completed': 3
    };
    
    const status = statusMap[this.selectedFilter];
    return this.orders.filter(order => order.status === status);
  }

  private normalizeStatus(status: number | string): number {
    if (typeof status === 'number') return status;
    const map: { [key: string]: number } = {
      'Pending': 0,
      'Preparing': 1,
      'ReadyForPickup': 2,
      'RestaurantAccepted': 1,
      'Completed': 3,
      'Delivered': 3
    };
    return map[status] ?? 0;
  }

  getStatusBadgeClass(status: number | string): string {
    const normStatus = this.normalizeStatus(status);
    const classes: { [key: number]: string } = {
      0: 'bg-[#00ff88]/15 border border-[#00ff88]/40 text-[#00ff88]',
      1: 'bg-yellow-500/15 border border-yellow-500/40 text-yellow-500',
      2: 'bg-blue-500/15 border border-blue-500/40 text-blue-500',
      3: 'bg-green-500/15 border border-green-500/40 text-green-500'
    };
    return classes[normStatus] || classes[0];
  }

  getStatusLabel(status: number | string): string {
    const normStatus = this.normalizeStatus(status);
    const labels: { [key: number]: string } = {
      0: 'New Order',
      1: 'In Preparation',
      2: 'Ready',
      3: 'Completed'
    };
    return labels[normStatus] || 'Unknown';
  }

  getProgressWidth(status: number | string): number {
    const normStatus = this.normalizeStatus(status);
    return (normStatus / 3) * 100;
  }

  isStageCompleted(orderStatus: number | string, stageValue: number): boolean {
    const normStatus = this.normalizeStatus(orderStatus);
    return normStatus >= stageValue;
  }

  isStagePassed(orderStatus: number | string, stageValue: number): boolean {
    const normStatus = this.normalizeStatus(orderStatus);
    return normStatus > stageValue;
  }

  updateOrderStatus(orderId: string, newStatus: number): void {
    this.partnerService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        const idx = this.orders.findIndex(o => o.id === orderId);
        if (idx > -1) {
          this.orders = [
            ...this.orders.slice(0, idx),
            { ...this.orders[idx], status: newStatus, updatedAt: new Date() },
            ...this.orders.slice(idx + 1)
          ];
          this.updateFilterCounts();
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.errorMessage = 'Failed to update order status. Please try again.';
        this.cdr.markForCheck();
      }
    });
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