import { PartnerSidebarComponent } from '../../../shared/components/partner-sidebar/partner-sidebar.component';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

import { PartnerService, Restaurant } from '../../../core/services/partner.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-partner-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PartnerSidebarComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class PartnerSettingsComponent implements OnInit, OnDestroy {
  get restaurantName(): string { return this.selectedRestaurant?.name || ''; }

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  restaurantId: string | null = null;
  showRestaurantDropdown = false;

  restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;

  restaurant: Restaurant = {
    id: '',
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    phoneNumber: '',
    email: '',
    isOpen: true,
    isApproved: false,
    openingTime: '',
    closingTime: '',
    prepTimeMinutes: 30
  };

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private partnerService: PartnerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

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
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.markForCheck();

      // Fetch full profile to get all fields (Address, Email, Phone, etc.) 
      // missing from the list-view DTO
      this.partnerService.getRestaurantProfile(this.restaurantId).subscribe({
        next: (fullProfile) => {
          this.restaurant = {
            ...fullProfile,
            address: fullProfile.address ? {
              street: fullProfile.address.street || '',
              city: fullProfile.address.city || '',
              state: fullProfile.address.state || '',
              pincode: fullProfile.address.pincode || ''
            } : {
              street: '',
              city: '',
              state: '',
              pincode: ''
            }
          };
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Failed to load restaurant profile.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
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

  saveSettings(): void {
    if (!this.restaurantId) {
      this.errorMessage = 'Restaurant ID not found.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    // Prepare DTO for backend (Strictly map to UpdateRestaurantDto)
    const updateDto = {
      name: this.restaurant.name,
      description: this.restaurant.description,
      logoUrl: this.restaurant.logoUrl,
      phoneNumber: this.restaurant.phoneNumber,
      email: this.restaurant.email,
      openingTime: this.restaurant.openingTime,
      closingTime: this.restaurant.closingTime,
      prepTimeMinutes: this.restaurant.prepTimeMinutes,
      address: {
        street: this.restaurant.address.street,
        city: this.restaurant.address.city,
        state: this.restaurant.address.state,
        pincode: this.restaurant.address.pincode
      },
      cuisineNames: (this.restaurant as any).cuisines || []
    };

    this.partnerService.updateRestaurant(this.restaurantId, updateDto as any).subscribe({
      next: () => {
        this.successMessage = 'Settings saved successfully!';
        this.isLoading = false;
        this.cdr.markForCheck();

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.markForCheck();
        }, 3000);
      },
      error: (error) => {
        console.error('Error saving settings:', error);
        this.errorMessage = error?.message || 'Failed to save settings. Please try again.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }
}