import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PartnerService, Order, Restaurant } from '../../../core/services/partner.service';
import { forkJoin, Subject, EMPTY } from 'rxjs';
import { switchMap, catchError, finalize, takeUntil, filter } from 'rxjs/operators';

interface DashboardStats {
  totalOrdersToday: number;
  activeOrders: number;
  menuItems: number;
  restaurantStatus: boolean;
}

@Component({
  selector: 'app-partner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class PartnerDashboardComponent implements OnInit, OnDestroy {
  restaurantName = '';
  restaurantId: string | null = null;
  isLoading = true;
  errorMessage = '';
  showRestaurantDropdown = false;

  restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;

  stats: DashboardStats = {
    totalOrdersToday: 0,
    activeOrders: 0,
    menuItems: 0,
    restaurantStatus: true
  };

  recentOrders: Order[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private partnerService: PartnerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load all restaurants once, which also sets selectedRestaurant$ in the service
    this.partnerService.getMyRestaurants().pipe(takeUntil(this.destroy$)).subscribe({
      next: (list) => {
        this.restaurants = list;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load restaurants.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });

    // React every time the selected restaurant changes
    this.partnerService.selectedRestaurant$.pipe(
      takeUntil(this.destroy$),
      filter(r => r !== null)
    ).subscribe(restaurant => {
      this.selectedRestaurant = restaurant;
      this.restaurantId = restaurant!.id;
      this.restaurantName = restaurant!.name;
      this.stats.restaurantStatus = restaurant!.isOpen;
      this.cdr.markForCheck();
      this.loadDashboardData(restaurant!.id);
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

  loadDashboardData(restaurantId: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    forkJoin({
      menuItems: this.partnerService.getMenuItems(restaurantId),
      orders: this.partnerService.getRestaurantOrders()
    }).pipe(
      catchError(error => {
        console.error('Dashboard load error:', error);
        this.errorMessage = 'Failed to load dashboard data. Please try again.';
        this.cdr.markForCheck();
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe(data => {
      if (!data) return;
      this.stats.menuItems = data.menuItems.length;

      // Filter orders for this specific restaurant
      const myOrders = data.orders.filter(o => o.restaurantId === restaurantId);
      this.recentOrders = myOrders.slice(0, 5);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = myOrders.filter(order => {
        const d = new Date(order.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      this.stats.totalOrdersToday = todayOrders.length;
      this.stats.activeOrders = myOrders.filter(o =>
        o.status === 0 || o.status === 1 || o.status === 2 ||
        o.status === 'Pending' || o.status === 'Preparing' ||
        o.status === 'ReadyForPickup' || o.status === 'RestaurantAccepted'
      ).length;

      this.cdr.markForCheck();
    });
  }

  getStatusLabel(status: any): string {
    if (typeof status === 'string') return status;
    const labels: { [key: number]: string } = { 0: 'Pending', 1: 'Preparing', 2: 'Ready', 3: 'Completed', 4: 'Cancelled' };
    return labels[status] || 'Unknown';
  }

  getStatusClass(status: any): string {
    if (typeof status === 'string') {
      if (status === 'Pending') return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      if (status === 'Preparing' || status === 'RestaurantAccepted') return 'bg-primary-container/10 border-primary-container/30 text-primary-container';
      if (status === 'ReadyForPickup' || status === 'OutForDelivery') return 'bg-secondary-container/10 border-secondary-container/30 text-secondary';
      if (status === 'Delivered' || status === 'Completed' || status === 'PickedUp') return 'bg-green-500/10 border-green-500/30 text-green-400';
      if (status.includes('Cancel') || status.includes('Reject')) return 'bg-red-500/10 border-red-500/30 text-red-400';
      return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
    const statusClasses: { [key: number]: string } = {
      0: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
      1: 'bg-primary-container/10 border-primary-container/30 text-primary-container',
      2: 'bg-secondary-container/10 border-secondary-container/30 text-secondary',
      3: 'bg-green-500/10 border-green-500/30 text-green-400',
      4: 'bg-red-500/10 border-red-500/30 text-red-400'
    };
    return statusClasses[status] || statusClasses[0];
  }

  getItemsSummary(order: Order): string {
    return order.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  }

  toggleRestaurantStatus(): void {
    if (!this.restaurantId) {
      this.errorMessage = 'Restaurant ID not found.';
      return;
    }
    
    const newStatus = !this.stats.restaurantStatus;
    
    this.partnerService.getRestaurantProfile(this.restaurantId).subscribe({
      next: (restaurant) => {
        restaurant.isOpen = newStatus;
        this.partnerService.updateRestaurant(this.restaurantId!, restaurant).subscribe({
          next: () => {
            this.stats.restaurantStatus = newStatus;
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error updating restaurant status:', error);
            this.errorMessage = 'Failed to update restaurant status.';
            this.cdr.markForCheck();
          }
        });
      },
      error: (error) => {
        console.error('Error loading restaurant:', error);
        this.errorMessage = 'Failed to load restaurant data.';
        this.cdr.markForCheck();
      }
    });
  }

  viewOrderDetails(order: Order): void {
    this.router.navigate(['/partner/orders'], { queryParams: { orderId: order.id } });
  }

  navigateToOrders(): void { this.router.navigate(['/partner/orders']); }
  navigateToMenuItems(): void { this.router.navigate(['/partner/menu-items']); }
  navigateToSettings(): void { this.router.navigate(['/partner/settings']); }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }
}
