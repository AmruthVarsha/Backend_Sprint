import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PartnerService, Category, Restaurant } from '../../../core/services/partner.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-partner-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class PartnerCategoriesComponent implements OnInit, OnDestroy {

  isLoading = false;
  errorMessage = '';
  restaurantName = '';
  restaurantId: string | null = null;
  showRestaurantDropdown = false;

  restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  categories: Category[] = [];

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
      this.loadCategories();
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
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.errorMessage = 'Failed to load categories. Please try again.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleCategoryStatus(category: Category): void {
    const newStatus = !category.isActive;
    this.partnerService.toggleCategoryStatus(category.id, newStatus).subscribe({
      next: () => {
        const idx = this.categories.findIndex(c => c.id === category.id);
        if (idx > -1) {
          this.categories = [
            ...this.categories.slice(0, idx),
            { ...this.categories[idx], isActive: newStatus },
            ...this.categories.slice(idx + 1)
          ];
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error updating category status:', error);
        this.errorMessage = 'Failed to update category status. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  editCategory(category: Category): void {
    console.log('Edit category:', category.id);
  }

  deleteCategory(categoryId: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.partnerService.deleteCategory(categoryId).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== categoryId);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.errorMessage = 'Failed to delete category. Please try again.';
          this.cdr.markForCheck();
        }
      });
    }
  }

  addNewCategory(): void {
    console.log('Add new category');
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }
}