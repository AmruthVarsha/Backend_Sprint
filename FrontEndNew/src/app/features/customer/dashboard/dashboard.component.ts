import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService, Restaurant as BackendRestaurant } from '../../../core/services/catalog.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService, CartItem } from '../../../core/services/cart.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FoodRevealAnimationComponent } from '../../../shared/components/food-reveal-animation/food-reveal-animation.component';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive';

interface Restaurant extends BackendRestaurant {
  isFavorite?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FoodRevealAnimationComponent, ScrollRevealDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  searchQuery: string = '';
  deliveryAddress: string = '';
  selectedCuisine: string = 'All Cuisines';
  isLoading: boolean = false;
  errorMessage: string = '';
  isAuthenticated: boolean = false;

  cuisines: string[] = ['All Cuisines'];

  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];

  cartItems: CartItem[] = [];

  constructor(
    private catalogService: CatalogService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadCuisines();
    this.loadRestaurants();

    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cdr.detectChanges();
    });
  }

  checkAuthentication(): void {
    // Subscribe to authentication state
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.cdr.detectChanges();
    });

    // If token exists but no user profile, fetch it
    if (this.authService.getAccessToken() && !this.authService.currentUserValue) {
      this.authService.getProfile().subscribe({
        next: () => {
          this.isAuthenticated = true;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isAuthenticated = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadCuisines(): void {
    this.catalogService.getCuisines().subscribe({
      next: (data) => {
        this.cuisines = ['All Cuisines', ...data.map(c => c.name)];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading cuisines:', err)
    });
  }

  loadRestaurants(pincode?: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const obs = pincode
      ? this.catalogService.getRestaurantsByPincode(pincode)
      : this.catalogService.getRestaurants();

    obs.subscribe({
      next: (data) => {
        this.restaurants = data.map(restaurant => ({
          ...restaurant,
          imageUrl: restaurant.logoUrl,
          cuisineType: restaurant.cuisines?.join(', ') || 'Various',
          deliveryTime: `${restaurant.prepTimeMinutes || 20}-${(restaurant.prepTimeMinutes || 20) + 10} min`,
          minimumOrder: 10,
          isFavorite: false
        }));
        this.filterRestaurants();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load restaurants. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Error loading restaurants:', error);
      }
    });
  }

  selectCuisine(cuisine: string): void {
    this.selectedCuisine = cuisine;
    this.filterRestaurants();
  }

  filterRestaurants(): void {
    let result = [...this.restaurants];

    // 1. Filter by Status (Must be Active and Approved)
    result = result.filter(r => r.isActive && r.isApproved);

    // 2. Filter by Operating Hours
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    result = result.filter(r => {
      // If no timing info, assume open (safety fallback)
      if (!r.openingTime || !r.closingTime) return true;

      // Basic string comparison works for HH:mm format
      return currentTime >= r.openingTime && currentTime <= r.closingTime;
    });

    // 3. Filter by Cuisine
    if (this.selectedCuisine !== 'All Cuisines') {
      result = result.filter(r =>
        r.cuisines?.some(cuisine =>
          cuisine.toLowerCase().includes(this.selectedCuisine.toLowerCase())
        ) || r.cuisineType?.toLowerCase().includes(this.selectedCuisine.toLowerCase())
      );
    }

    // 4. Filter by Search Query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();

      // If query is a 6-digit pincode, reload restaurants for that area
      if (/^\d{6}$/.test(query)) {
        this.loadRestaurants(query);
        return;
      }

      result = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.cuisines?.some(c => c.toLowerCase().includes(query)) ||
        r.cuisineType?.toLowerCase().includes(query)
      );
    }

    this.filteredRestaurants = result;
  }

  toggleFavorite(restaurant: Restaurant): void {
    restaurant.isFavorite = !restaurant.isFavorite;
  }

  addToCart(restaurant: Restaurant): void {
    // Navigate to restaurant detail page
    this.router.navigate(['/customer/restaurant', restaurant.id]);
  }

  updateCartQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    this.cartService.updateQuantity(item.menuItem.id, newQuantity);
  }

  removeFromCart(item: CartItem): void {
    this.cartService.removeItem(item.menuItem.id);
  }

  get cartSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  }

  get deliveryFee(): number {
    return this.cartSubtotal > 500 ? 0 : 40;
  }

  get cartTotal(): number {
    return this.cartSubtotal + this.deliveryFee;
  }

  get cartItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  findFood(): void {
    // Attempt to extract 6-digit pincode from address string
    const pincodeMatch = this.deliveryAddress.match(/\d{6}/);
    if (pincodeMatch) {
      const pincode = pincodeMatch[0];
      this.loadRestaurants(pincode);
    } else {
      // If no pincode, just reload all
      this.loadRestaurants();
    }
  }

  goToCheckout(): void {
    this.router.navigate(['/customer/checkout']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if API call fails, redirect to login
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
