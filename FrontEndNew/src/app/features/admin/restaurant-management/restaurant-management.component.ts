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
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './restaurant-management.component.html',
  styleUrls: ['./restaurant-management.component.css']
})
export class AdminRestaurantManagementComponent implements OnInit, OnDestroy {

  searchQuery = '';
  isLoading = false;
  errorMessage = '';
  
  restaurants: Restaurant[] = [];

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

  viewRestaurant(restaurant: Restaurant): void {
    console.log('View restaurant:', restaurant.restaurantId);
  }

  toggleRestaurantStatus(restaurant: Restaurant): void {
    // Call API here if available, ignoring for now since it wasn't implemented
    restaurant.isActive = !restaurant.isActive;
    console.log(`Restaurant ${restaurant.restaurantId} status updated to ${restaurant.isActive}`);
  }

  deleteRestaurant(restaurantId: string): void {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      this.adminService.deleteRestaurant(restaurantId).subscribe({
        next: () => {
          this.restaurants = this.restaurants.filter(r => r.restaurantId !== restaurantId);
          this.cdr.markForCheck();
          console.log('Restaurant deleted:', restaurantId);
        },
        error: (err) => {
          console.error('Failed to delete restaurant', err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
