import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartService, CartItem } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { UserService } from '../../../core/services/user.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { PaymentMethod, CheckoutDTO } from '../../../shared/models/order.model';
import { AddressResponseDTO } from '../../../shared/models/user.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  cartItems: CartItem[] = [];
  addresses: AddressResponseDTO[] = [];
  selectedAddressId: string = '';
  selectedPaymentMethod: PaymentMethod = PaymentMethod.COD;
  deliveryInstructions: string = '';
  scheduledSlot: string = '';

  isLoadingAddresses = false;
  isPlacingOrder = false;
  errorMessage = '';

  readonly PaymentMethod = PaymentMethod;
  Math = Math;

  /** Cart items grouped by restaurant for display */
  get restaurantGroups(): { restaurantId: string; restaurantName: string; items: CartItem[] }[] {
    const map = new Map<string, { restaurantId: string; restaurantName: string; items: CartItem[] }>();
    for (const item of this.cartItems) {
      if (!map.has(item.restaurantId)) {
        map.set(item.restaurantId, { restaurantId: item.restaurantId, restaurantName: item.restaurantName, items: [] });
      }
      map.get(item.restaurantId)!.items.push(item);
    }
    return Array.from(map.values());
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  }

  get deliveryFee(): number {
    return this.subtotal > 500 ? 0 : 40;
  }

  get taxes(): number {
    return Math.round(this.subtotal * 0.05);
  }

  get total(): number {
    return this.subtotal + this.deliveryFee + this.taxes;
  }

  get selectedAddress(): AddressResponseDTO | undefined {
    return this.addresses.find(a => a.id === this.selectedAddressId);
  }

  get canPlaceOrder(): boolean {
    return this.cartItems.length > 0 && !!this.selectedAddressId && !this.isPlacingOrder;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.cartItems = items;
      this.cdr.detectChanges();
    });
    this.cartItems = this.cartService.getCartItems();
    this.loadAddresses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAddresses(): void {
    this.isLoadingAddresses = true;
    this.userService.getAddresses().pipe(takeUntil(this.destroy$)).subscribe({
      next: (addrs) => {
        this.addresses = addrs;
        if (addrs.length > 0) this.selectedAddressId = addrs[0].id;
        this.isLoadingAddresses = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAddresses = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateQuantity(item: CartItem, change: number): void {
    this.cartService.updateQuantity(item.menuItem.id, item.quantity + change);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.menuItem.id);
  }

  placeOrder(): void {
    if (!this.canPlaceOrder) return;

    this.isPlacingOrder = true;
    this.errorMessage = '';

    const dto: CheckoutDTO = {
      addressId: this.selectedAddressId,
      paymentMethod: this.selectedPaymentMethod,
      deliveryInstructions: this.deliveryInstructions || undefined,
      scheduledSlot: this.scheduledSlot || undefined,
      items: this.cartItems.map(item => ({
        menuItemId: item.menuItem.id,
        menuItemName: item.menuItem.name,
        unitPrice: item.menuItem.price,
        quantity: item.quantity,
        restaurantId: item.restaurantId
      }))
    };

    this.orderService.checkout(dto).pipe(takeUntil(this.destroy$)).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.router.navigate(['/customer/order-tracking', order.id]);
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Failed to place order. Please try again.';
        this.isPlacingOrder = false;
        this.cdr.detectChanges();
      }
    });
  }
}
