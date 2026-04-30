import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService, Restaurant, MenuItem } from '../../../core/services/catalog.service';
import { CartService, CartItem } from '../../../core/services/cart.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.css']
})
export class RestaurantDetailComponent implements OnInit {
  restaurantId!: string;
  restaurant: Restaurant | null = null;
  menuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  cartItems: CartItem[] = [];
  
  isLoadingRestaurant = false;
  isLoadingMenu = false;
  errorMessage = '';
  
  selectedTab: 'menu' | 'info' | 'reviews' = 'menu';
  selectedCategory = 'All Items';
  
  categories: string[] = ['All Items', 'Appetizers', 'Main Courses', 'Signature Cocktails', 'Desserts'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.restaurantId = params['id'];
      this.loadRestaurantDetails();
      this.loadMenuItems();
      // Proactively ensure cart exists/is loaded
      this.cartService.loadCartForRestaurant(this.restaurantId);
    });

    // Subscribe to cart changes
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items.filter(item => item.restaurantId === this.restaurantId);
      this.cdr.detectChanges();
    });
  }

  loadRestaurantDetails(): void {
    this.isLoadingRestaurant = true;
    this.errorMessage = '';
    console.log('Loading restaurant details for ID:', this.restaurantId);

    this.catalogService.getRestaurantById(this.restaurantId).subscribe({
      next: (data) => {
        console.log('Restaurant data received:', data);
        // Map backend fields to display fields
        this.restaurant = {
          ...data,
          imageUrl: data.logoUrl,
          cuisineType: data.cuisines?.join(', ') || 'Various',
          deliveryTime: `${data.prepTimeMinutes || 20}-${(data.prepTimeMinutes || 20) + 10} min`,
          minimumOrder: 10
        };
        this.isLoadingRestaurant = false;
        this.cdr.detectChanges();
        console.log('Restaurant loaded and change detection triggered');
      },
      error: (error) => {
        this.errorMessage = 'Failed to load restaurant details.';
        this.isLoadingRestaurant = false;
        this.cdr.detectChanges();
        console.error('Error loading restaurant:', error);
      }
    });
  }

  loadMenuItems(): void {
    this.isLoadingMenu = true;
    console.log('Loading menu items for restaurant ID:', this.restaurantId);

    this.catalogService.getMenuItemsByRestaurant(this.restaurantId).subscribe({
      next: (data) => {
        console.log('Menu items received:', data);
        this.menuItems = data;
        this.filteredMenuItems = [...this.menuItems];
        this.isLoadingMenu = false;
        this.cdr.detectChanges();
        console.log('Menu items loaded and change detection triggered');
      },
      error: (error) => {
        console.error('Error loading menu items:', error);
        this.isLoadingMenu = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectTab(tab: 'menu' | 'info' | 'reviews'): void {
    this.selectedTab = tab;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterMenuItems();
  }

  filterMenuItems(): void {
    if (this.selectedCategory === 'All Items') {
      this.filteredMenuItems = [...this.menuItems];
    } else {
      // Filter by category if your backend supports category names
      this.filteredMenuItems = this.menuItems.filter(item => 
        item.categoryId.toString() === this.selectedCategory
      );
    }
  }

  addingItemId: string | null = null;
  addError = '';

  addToCart(menuItem: MenuItem): void {
    if (!this.restaurant || this.addingItemId === menuItem.id) return;
    this.addingItemId = menuItem.id;
    this.addError = '';

    this.cartService.addItemAsync(menuItem, this.restaurantId, this.restaurant.name)
      .subscribe({
        next: () => {
          this.addingItemId = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.addingItemId = null;
          this.addError = err?.message || 'Failed to add item. Please try again.';
          this.cdr.detectChanges();
        }
      });
  }

  updateQuantity(cartItem: CartItem, change: number): void {
    this.cartService.updateQuantity(cartItem.menuItem.id, cartItem.quantity + change);
  }

  removeFromCart(cartItem: CartItem): void {
    this.cartService.removeItem(cartItem.menuItem.id);
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

  checkout(): void {
    if (this.cartItems.length === 0) {
      return;
    }
    this.router.navigate(['/customer/checkout']);
  }
}
