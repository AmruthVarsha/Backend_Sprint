import { PartnerSidebarComponent } from '../../../shared/components/partner-sidebar/partner-sidebar.component';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

import { PartnerService, MenuItem, Restaurant, Category } from '../../../core/services/partner.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-partner-menu-items',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PartnerSidebarComponent],
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
  categories: Category[] = [];

  showItemModal = false;
  isEditing = false;
  currentItemId: string | null = null;
  itemForm!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private partnerService: PartnerService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(300)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      categoryName: ['', [Validators.required]],
      imageUrl: [''],
      isVeg: [true],
      prepTimeMinutes: [15, [Validators.required, Validators.min(1), Validators.max(120)]],
      isAvailable: [true]
    });
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
      this.loadCategories();
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

  loadCategories(): void {
    if (!this.restaurantId) return;
    this.partnerService.getCategories(this.restaurantId).subscribe({
      next: (cats) => {
        this.categories = cats;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading categories', err)
    });
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
    this.isEditing = false;
    this.currentItemId = null;
    this.itemForm.reset({
      price: 0,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=300&auto=format&fit=crop',
      prepTimeMinutes: 15,
      isAvailable: true
    });
    this.showItemModal = true;
    this.cdr.markForCheck();
  }

  handleImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=300&auto=format&fit=crop';
    event.target.onerror = null;
  }

  editItem(item: MenuItem): void {
    this.isEditing = true;
    this.currentItemId = item.id;
    
    // Find category name by id to pre-select dropdown
    const category = this.categories.find(c => c.id === item.categoryId);
    
    this.itemForm.patchValue({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryName: category?.name || '',
      imageUrl: item.imageUrl,
      isVeg: item.isVegetarian,
      prepTimeMinutes: item.preparationTime,
      isAvailable: item.isAvailable
    });
    
    this.showItemModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showItemModal = false;
    this.cdr.markForCheck();
  }

  saveItem(): void {
    if (this.itemForm.invalid || !this.restaurantId) return;

    this.isLoading = true;
    const formValue = this.itemForm.value;

    const dto = {
      restaurantId: this.restaurantId,
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      categoryName: formValue.categoryName,
      imageUrl: formValue.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=300&auto=format&fit=crop',
      isVeg: formValue.isVeg,
      prepTimeMinutes: formValue.prepTimeMinutes,
      isAvailable: formValue.isAvailable
    };

    if (this.isEditing && this.currentItemId) {
      this.partnerService.updateMenuItem(this.currentItemId, dto as any).subscribe({
        next: () => {
          this.loadMenuItems();
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to update menu item';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.partnerService.createMenuItem(dto).subscribe({
        next: () => {
          this.loadMenuItems();
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to create menu item';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    }
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