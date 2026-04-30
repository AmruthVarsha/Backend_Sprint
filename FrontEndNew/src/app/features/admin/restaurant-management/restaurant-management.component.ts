import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Subject, EMPTY } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';

export interface Restaurant {
  restaurantId: string;
  name: string;
  ownerId: string;
  email: string;
  phoneNumber: string;
  rating: number;
  totalRatings?: number;
  isActive: boolean;
  isApproved: boolean;
}


@Component({
  selector: 'app-admin-restaurant-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminSidebarComponent],
  templateUrl: './restaurant-management.component.html',
  styleUrls: ['./restaurant-management.component.css']
})
export class AdminRestaurantManagementComponent implements OnInit, OnDestroy {

  searchQuery = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  restaurants: Restaurant[] = [];

  deletingRestaurantId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRestaurants(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.adminService.getAllRestaurants().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to load restaurants', err);
        this.errorMessage = 'Failed to load restaurants.';
        this.cdr.markForCheck();
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe(data => {
      if (data) {
        this.restaurants = data;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredRestaurants(): Restaurant[] {
    if (!this.searchQuery.trim()) {
      return this.restaurants;
    }

    const query = this.searchQuery.toLowerCase();
    return this.restaurants.filter(r =>
      (r.name && r.name.toLowerCase().includes(query)) ||
      (r.email && r.email.toLowerCase().includes(query)) ||
      (r.phoneNumber && r.phoneNumber.toLowerCase().includes(query))
    );
  }

  deleteRestaurant(restaurantId: string): void {
    const restaurant = this.restaurants.find(r => r.restaurantId === restaurantId);
    if (!restaurant) return;

    if (!confirm(`Delete "${restaurant.name}"?\nThis action cannot be undone.`)) return;

    this.deletingRestaurantId = restaurantId;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.adminService.deleteRestaurant(restaurantId).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to delete restaurant', err);
        this.errorMessage = `Failed to delete "${restaurant.name}".`;
        this.cdr.markForCheck();
        return EMPTY;
      }),
      finalize(() => {
        this.deletingRestaurantId = null;
        this.cdr.markForCheck();
      })
    ).subscribe(() => {
      this.restaurants = this.restaurants.filter(r => r.restaurantId !== restaurantId);
      this.successMessage = `"${restaurant.name}" was deleted.`;
      this.cdr.markForCheck();
      setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
    });
  }

  toggleRestaurantStatus(restaurant: Restaurant): void {
    const newStatus = !restaurant.isActive;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.adminService.updateRestaurantStatus(restaurant.restaurantId, newStatus).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to update status', err);
        this.errorMessage = `Failed to update status for "${restaurant.name}".`;
        this.cdr.markForCheck();
        return EMPTY;
      })
    ).subscribe(() => {
      restaurant.isActive = newStatus;
      this.successMessage = `"${restaurant.name}" is now ${newStatus ? 'Active' : 'Inactive'}.`;
      this.cdr.markForCheck();
      setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}