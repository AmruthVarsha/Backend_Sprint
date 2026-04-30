import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PartnerService, Restaurant } from '../../../core/services/partner.service';
import { finalize, takeUntil, filter } from 'rxjs/operators';
import { PartnerSidebarComponent } from '../../../shared/components/partner-sidebar/partner-sidebar.component';
import { Subject } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PartnerSidebarComponent],
  templateUrl: './add-restaurant.component.html'
})
export class AddRestaurantComponent implements OnInit, OnDestroy {
  restaurantForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  availableCuisines: any[] = [];
  selectedCuisineNames: Set<string> = new Set();

  restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  get restaurantName(): string { return this.selectedRestaurant?.name || 'New Restaurant'; }

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCuisines();
    this.loadRestaurants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRestaurants(): void {
    this.partnerService.getMyRestaurants().pipe(takeUntil(this.destroy$)).subscribe({
      next: (list) => { this.restaurants = list; this.cdr.markForCheck(); },
      error: () => { console.error('Failed to load restaurants.'); }
    });

    this.partnerService.selectedRestaurant$.pipe(
      takeUntil(this.destroy$),
      filter(r => r !== null)
    ).subscribe(restaurant => {
      this.selectedRestaurant = restaurant;
      this.cdr.markForCheck();
    });
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.partnerService.setSelectedRestaurant(restaurant);
    this.cdr.markForCheck();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }

  private initForm(): void {
    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(300)]],
      logoUrl: [''],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      openingTime: ['', [Validators.required]],
      closingTime: ['', [Validators.required]],
      prepTimeMinutes: [30, [Validators.required, Validators.min(1), Validators.max(120)]],
      address: this.fb.group({
        street: ['', [Validators.required, Validators.maxLength(100)]],
        city: ['', [Validators.required, Validators.maxLength(50)]],
        state: ['', [Validators.required, Validators.maxLength(50)]],
        pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
      })
    });
  }

  private loadCuisines(): void {
    this.partnerService.getCuisines().subscribe({
      next: (cuisines) => {
        this.availableCuisines = cuisines;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading cuisines:', error);
      }
    });
  }

  toggleCuisine(cuisineName: string): void {
    if (this.selectedCuisineNames.has(cuisineName)) {
      this.selectedCuisineNames.delete(cuisineName);
    } else {
      this.selectedCuisineNames.add(cuisineName);
    }
  }

  onSubmit(): void {
    if (this.restaurantForm.invalid) {
      this.restaurantForm.markAllAsTouched();
      return;
    }

    if (this.selectedCuisineNames.size === 0) {
      this.errorMessage = 'Please select at least one cuisine.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = this.restaurantForm.value;
    const createDto = {
      ...formData,
      cuisineNames: Array.from(this.selectedCuisineNames)
    };

    this.partnerService.createRestaurant(createDto)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          // After creation, redirect to dashboard.
          // The dashboard will refetch and show the pending restaurant.
          this.router.navigate(['/partner/dashboard']);
        },
        error: (error) => {
          console.error('Error creating restaurant:', error);
          this.errorMessage = error.error?.message || 'Failed to create restaurant. Please check your inputs.';
        }
      });
  }
}
