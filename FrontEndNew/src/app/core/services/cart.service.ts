import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MenuItem } from './catalog.service';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {

  private cartItems = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItems.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  // ─── Storage ──────────────────────────────────────────────────────────────

  private loadFromStorage(): void {
    try {
      const cart = localStorage.getItem('cart');
      if (cart) this.cartItems.next(JSON.parse(cart));
    } catch { /* ignore */ }
  }

  private persist(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }

  // ─── Public accessors ─────────────────────────────────────────────────────

  getCartItems(): CartItem[] { return this.cartItems.value; }
  getCartCount(): number { return this.cartItems.value.reduce((s, i) => s + i.quantity, 0); }
  getCartTotal(): number {
    return this.cartItems.value.reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
  }

  // ─── Add item ─────────────────────────────────────────────────────────────

  addItem(menuItem: MenuItem, restaurantId: string, restaurantName: string): void {
    const current = this.cartItems.value;
    const existing = current.find(i => i.menuItem.id === menuItem.id);

    if (existing) {
      this.cartItems.next(current.map(i =>
        i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      const tempItem: CartItem = { menuItem, quantity: 1, restaurantId, restaurantName };
      this.cartItems.next([...current, tempItem]);
    }
    this.persist();
  }

  // ─── Update quantity ──────────────────────────────────────────────────────

  updateQuantity(menuItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(menuItemId);
      return;
    }

    this.cartItems.next(this.cartItems.value.map(i =>
      i.menuItem.id === menuItemId ? { ...i, quantity } : i
    ));
    this.persist();
  }

  // ─── Remove item ──────────────────────────────────────────────────────────

  removeItem(menuItemId: string): void {
    this.cartItems.next(this.cartItems.value.filter(i => i.menuItem.id !== menuItemId));
    this.persist();
  }

  // ─── Clear ────────────────────────────────────────────────────────────────

  clearCart(): void {
    this.cartItems.next([]);
    localStorage.removeItem('cart');
  }

  // Fallback for components that might still expect observables
  addItemAsync(menuItem: MenuItem, restaurantId: string, restaurantName: string): Observable<any> {
    this.addItem(menuItem, restaurantId, restaurantName);
    return of({ success: true });
  }

  /**
   * Compatibility methods for components that used proactive cart management
   */
  ensureCart(restaurantId: string): Observable<string> {
    return of('local-cart');
  }

  loadCartForRestaurant(restaurantId: string): void {
    // Already loaded in constructor from localStorage
  }
}
