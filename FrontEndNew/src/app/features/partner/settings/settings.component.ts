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
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class PartnerSettingsComponent implements OnInit, OnDestroy {

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
    address: '',
    phoneNumber: '',
    email: '',
    isOpen: true
  };

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
      this.restaurant = { ...restaurant! };
      this.restaurantId = restaurant!.id;
      this.isLoading = false;
      this.cdr.markForCheck();
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

    this.partnerService.updateRestaurant(this.restaurantId, this.restaurant).subscribe({
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
        this.errorMessage = 'Failed to save settings. Please try again.';
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