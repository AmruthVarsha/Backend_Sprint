import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService, CartItem } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  searchQuery: string = '';
  isAuthenticated: boolean = false;
  userRole: string | number | null = null;
  cartItems: CartItem[] = [];

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check authentication status
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        const user = this.authService.currentUserValue;
        this.userRole = user?.role ?? null;
      } else {
        this.userRole = null;
      }
      this.cdr.detectChanges();
    });

    // Subscribe to cart changes
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cdr.detectChanges();
    });
  }

  get cartItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
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

  updateCartQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    this.cartService.updateQuantity(item.menuItem.id, newQuantity);
  }

  goToDashboard(): void {
    const role = this.userRole;
    if (role === 0 || role === 'Customer') {
      this.router.navigate(['/customer/dashboard']);
    } else if (role === 1 || role === 'Partner') {
      this.router.navigate(['/partner/dashboard']);
    } else if (role === 2 || role === 'DeliveryAgent' || role === 'Delivery Agent') {
      this.router.navigate(['/delivery/dashboard']);
    } else if (role === 3 || role === 'Admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  goToCheckout(): void {
    this.router.navigate(['/customer/checkout']);
  }

  goToProfile(): void {
    const role = this.userRole;
    if (role === 0 || role === 'Customer') {
      this.router.navigate(['/customer/profile']);
    } else if (role === 1 || role === 'Partner') {
      this.router.navigate(['/partner/profile']);
    } else if (role === 2 || role === 'DeliveryAgent' || role === 'Delivery Agent') {
      this.router.navigate(['/delivery/account']);
    } else if (role === 3 || role === 'Admin') {
      this.router.navigate(['/admin/profile']);
    } else {
      this.router.navigate(['/']);
    }
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
