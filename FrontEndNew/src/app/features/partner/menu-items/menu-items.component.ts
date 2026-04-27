import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PartnerService, MenuItem, Restaurant } from '../../../core/services/partner.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-partner-menu-items',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './menu-items.component.html',
  styleUrls: ['./menu-items.component.css']
})
export class PartnerMenuItemsComponent implements OnInit, OnDestroy {

  isLoading = false;
  errorMessage = '';
  restaurantName = '';
  searchQuery = '';
  restaurantId: string | null = null;
  showRestaurantDropdown = false;

  restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  menuItems: MenuItem[] = [];

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
      this.restaurantId = restaurant!.id;
      this.restaurantName = restaurant!.name;
      this.cdr.markForCheck();
      this.loadMenuItems();
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

  loadMenuItems(): void {
    if (!this.restaurantId) return;

    this.partnerService.getMenuItems(this.restaurantId).subscribe({
      next: (items) => {
        this.menuItems = items;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading menu items:', error);
        this.errorMessage = 'Failed to load menu items. Please try again.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredMenuItems(): MenuItem[] {
    if (!this.searchQuery.trim()) {
      return this.menuItems;
    }
    
    const query = this.searchQuery.toLowerCase();
    return this.menuItems.filter(item => {
      const matchName = item.name?.toLowerCase().includes(query) || false;
      const matchDesc = item.description?.toLowerCase().includes(query) || false;
      return matchName || matchDesc;
    });
  }

  get totalItems(): number {
    return this.menuItems.length;
  }

  get activeItems(): number {
    return this.menuItems.filter(item => item.isAvailable).length;
  }

  get mostPopularItem(): string {
    // TODO: Get from actual analytics
    return 'Truffle Burger';
  }

  onSearch(): void {
    // Search is handled by filteredMenuItems getter
  }

  toggleAvailability(item: MenuItem): void {
    const newAvailability = !item.isAvailable;
    this.partnerService.updateMenuItem(item.id, { ...item, isAvailable: newAvailability }).subscribe({
      next: () => {
        item.isAvailable = newAvailability;
        // Replace the item in the array with a new object reference so Angular detects the change
        const idx = this.menuItems.findIndex(m => m.id === item.id);
        if (idx > -1) {
          this.menuItems = [
            ...this.menuItems.slice(0, idx),
            { ...this.menuItems[idx], isAvailable: newAvailability },
            ...this.menuItems.slice(idx + 1)
          ];
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error updating item availability:', error);
        this.errorMessage = 'Failed to update item availability. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  openAddItemDialog(): void {
    // TODO: Open dialog/modal to add new item
    console.log('Open add item dialog');
  }

  editItem(item: MenuItem): void {
    // TODO: Open dialog/modal to edit item
    console.log('Edit item:', item.id);
  }

  deleteItem(itemId: string): void {
    if (confirm('Are you sure you want to delete this menu item?')) {
      this.partnerService.deleteMenuItem(itemId).subscribe({
        next: () => {
          this.menuItems = this.menuItems.filter(item => item.id !== itemId);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          this.errorMessage = 'Failed to delete item. Please try again.';
          this.cdr.markForCheck();
        }
      });
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