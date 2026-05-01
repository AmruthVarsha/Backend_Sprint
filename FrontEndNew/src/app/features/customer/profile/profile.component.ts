import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { OrderService } from '../../../core/services/order.service';
import { ProfileDTO, UpdateProfileDTO, AddressResponseDTO, AddressDTO, UpdateAddressDTO } from '../../../shared/models/user.model';
import { ChangePasswordDTO } from '../../../shared/models/auth.model';
import { OrderResponseDTO } from '../../../shared/models/order.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

type TabType = 'personal' | 'security' | 'addresses' | 'orders';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  activeTab: TabType = 'personal';
  userProfile: ProfileDTO | null = null;
  
  // Forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  addressForm!: FormGroup;
  
  // Loading states
  isLoadingProfile: boolean = false;
  isSavingProfile: boolean = false;
  isChangingPassword: boolean = false;
  isLoadingAddresses: boolean = false;
  isSavingAddress: boolean = false;
  isLoadingOrders: boolean = false;
  
  // Messages
  successMessage: string = '';
  errorMessage: string = '';
  
  // Two-factor auth
  isTwoFactorEnabled: boolean = false;

  // Addresses
  addresses: AddressResponseDTO[] = [];
  showAddressForm: boolean = false;
  editingAddressId: string | null = null;

  // Orders
  orders: OrderResponseDTO[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  get isCustomer(): boolean {
    return this.userProfile ? this.getRoleName(this.userProfile.role) === 'Customer' : false;
  }

  ngOnInit(): void {
    this.initializeForms();
    
    // Debug: Check auth state and localStorage
    console.log('=== Profile Component Init ===');
    console.log('Is authenticated:', this.authService.isAuthenticated);
    console.log('Current user:', this.authService.currentUserValue);
    console.log('Access token:', this.authService.getAccessToken());
    
    // Check localStorage directly
    const storedUser = localStorage.getItem('user_info');
    console.log('Stored user in localStorage:', storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed user:', parsedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    
    this.loadUserProfile();

    // Deep link to specific tab or action
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const tab = params['tab'] as TabType;
        if (['personal', 'security', 'addresses', 'orders'].includes(tab)) {
          this.selectTab(tab);
        }
      }
      
      if (params['action'] === 'addAddress') {
        this.selectTab('addresses');
        this.showAddAddressForm();
      }
    });
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNo: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.addressForm = this.fb.group({
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  loadUserProfile(): void {
    this.isLoadingProfile = true;
    
    // Fetch user profile from UserController
    console.log('Fetching user profile from UserController...');
    this.userService.getProfile().subscribe({
      next: (user) => {
        console.log('=== User profile fetched ===');
        console.log('Full user object:', JSON.stringify(user, null, 2));
        console.log('User fullName:', user.fullName);
        console.log('User email:', user.email);
        console.log('User phoneNo:', user.phoneNo);
        console.log('User role:', user.role);
        
        this.userProfile = user;
        this.isTwoFactorEnabled = user.isTwoFactorEnabled || false;
        
        // Patch form values with correct field names
        const formValues = {
          fullName: user.fullName || '',
          email: user.email || '',
          phoneNo: user.phoneNo || ''
        };
        
        console.log('Patching form with values:', formValues);
        this.profileForm.patchValue(formValues);
        
        console.log('Form values after patch:', this.profileForm.value);
        console.log('Form valid:', this.profileForm.valid);
        console.log('FullName control value:', this.profileForm.get('fullName')?.value);
        console.log('Email control value:', this.profileForm.get('email')?.value);
        console.log('PhoneNo control value:', this.profileForm.get('phoneNo')?.value);
        
        this.isLoadingProfile = false;
        this.cdr.detectChanges();
        
        console.log('Change detection triggered');
      },
      error: (error) => {
        console.error('Error loading profile from UserController:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        this.errorMessage = 'Failed to load profile';
        this.isLoadingProfile = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectTab(tab: TabType): void {
    this.activeTab = tab;
    this.clearMessages();
    
    // Load data for specific tabs
    if (tab === 'addresses' && this.addresses.length === 0) {
      this.loadAddresses();
    } else if (tab === 'orders' && this.orders.length === 0) {
      this.loadOrders();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isSavingProfile = true;
    this.clearMessages();

    const updateData: UpdateProfileDTO = {
      fullName: this.profileForm.value.fullName,
      email: this.profileForm.value.email, // Include email even though it's read-only
      phoneNo: this.profileForm.value.phoneNo
    };

    this.userService.updateProfile(updateData).subscribe({
      next: (message) => {
        this.successMessage = message || 'Profile updated successfully!';
        // Update local profile data
        if (this.userProfile) {
          this.userProfile.fullName = updateData.fullName;
          this.userProfile.email = updateData.email;
          this.userProfile.phoneNo = updateData.phoneNo;
        }
        this.isSavingProfile = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update profile';
        this.isSavingProfile = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.errorMessage = 'Please fill all password fields correctly';
      return;
    }

    this.isChangingPassword = true;
    this.clearMessages();

    const passwordData: ChangePasswordDTO = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmNewPassword: this.passwordForm.value.confirmPassword
    };

    this.authService.changePassword(passwordData).subscribe({
      next: () => {
        this.successMessage = 'Password changed successfully!';
        this.passwordForm.reset();
        this.isChangingPassword = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to change password';
        this.isChangingPassword = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleTwoFactor(): void {
    this.isTwoFactorEnabled = !this.isTwoFactorEnabled;
    
    this.authService.setTwoFactorAuth(this.isTwoFactorEnabled).subscribe({
      next: () => {
        this.successMessage = `Two-factor authentication ${this.isTwoFactorEnabled ? 'enabled' : 'disabled'}`;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isTwoFactorEnabled = !this.isTwoFactorEnabled; // Revert on error
        this.errorMessage = 'Failed to update two-factor authentication';
        this.cdr.detectChanges();
      }
    });
  }

  sendVerificationEmail(): void {
    this.authService.sendEmailConfirmationOTP().subscribe({
      next: () => {
        this.successMessage = 'Verification email sent! Redirecting...';
        this.cdr.detectChanges();
        // Navigate to confirm-email page
        setTimeout(() => {
          this.router.navigate(['/auth/confirm-email']);
        }, 1000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to send verification email';
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getRoleName(role: string | number): string {
    // Handle both string and number roles
    if (typeof role === 'string') {
      return role;
    }
    const roles = ['Customer', 'Partner', 'Delivery Agent', 'Admin'];
    return roles[role] || 'Unknown';
  }

  getAccountStatusName(status?: number): string {
    // Derive from real isActive when available
    if (this.userProfile) {
      return this.userProfile.isActive ? 'Active' : 'Inactive';
    }
    if (status === undefined) return 'Active';
    const statuses = ['Active', 'Inactive', 'Suspended', 'Pending Approval'];
    return statuses[status] || 'Unknown';
  }

  getAccountStatusClass(status?: number): string {
    const isActive = this.userProfile ? this.userProfile.isActive : status === 0 || status === undefined;
    return isActive
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }

  formatDate(date?: Date | string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // ============================================
  // ADDRESS MANAGEMENT
  // ============================================

  loadAddresses(): void {
    this.isLoadingAddresses = true;
    this.userService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.isLoadingAddresses = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.errorMessage = 'Failed to load addresses';
        this.isLoadingAddresses = false;
        this.cdr.detectChanges();
      }
    });
  }

  showAddAddressForm(): void {
    this.showAddressForm = true;
    this.editingAddressId = null;
    this.addressForm.reset();
    this.clearMessages();
  }

  editAddress(address: AddressResponseDTO): void {
    this.showAddressForm = true;
    this.editingAddressId = address.id;
    this.addressForm.patchValue({
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    });
    this.clearMessages();
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.errorMessage = 'Please fill all address fields correctly';
      return;
    }

    this.isSavingAddress = true;
    this.clearMessages();

    const addressData = this.addressForm.value;

    if (this.editingAddressId) {
      // Update existing address
      const updateDto: UpdateAddressDTO = {
        id: this.editingAddressId,
        ...addressData
      };
      
      this.userService.updateAddress(updateDto).subscribe({
        next: () => {
          this.successMessage = 'Address updated successfully!';
          this.showAddressForm = false;
          this.loadAddresses();
          this.isSavingAddress = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update address';
          this.isSavingAddress = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Add new address
      const addDto: AddressDTO = addressData;
      
      this.userService.addAddress(addDto).subscribe({
        next: () => {
          this.successMessage = 'Address added successfully!';
          this.showAddressForm = false;
          this.loadAddresses();
          this.isSavingAddress = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to add address';
          this.isSavingAddress = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteAddress(id: string): void {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    this.userService.deleteAddress(id).subscribe({
      next: () => {
        this.successMessage = 'Address deleted successfully!';
        this.loadAddresses();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to delete address';
        this.cdr.detectChanges();
      }
    });
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddressId = null;
    this.addressForm.reset();
    this.clearMessages();
  }

  // ============================================
  // ORDER HISTORY
  // ============================================

  loadOrders(): void {
    this.isLoadingOrders = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders: OrderResponseDTO[]) => {
        this.orders = orders;
        this.isLoadingOrders = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Failed to load order history';
        this.isLoadingOrders = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewOrder(orderId: string): void {
    this.router.navigate(['/customer/order-tracking', orderId]);
  }

  getOrderStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'RestaurantAccepted': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Preparing': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'OutForDelivery': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'Delivered': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'CancelledByCustomer': 'bg-red-500/10 text-red-400 border-red-500/20',
      'CancelledByRestaurant': 'bg-red-500/10 text-red-400 border-red-500/20',
      'RestaurantRejected': 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return statusMap[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }

  getOrderStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'Pending',
      'RestaurantAccepted': 'Accepted',
      'RestaurantRejected': 'Rejected',
      'Preparing': 'Preparing',
      'ReadyForPickup': 'Ready',
      'PickedUp': 'Picked Up',
      'OutForDelivery': 'Out for Delivery',
      'Delivered': 'Delivered',
      'CancelledByCustomer': 'Cancelled',
      'CancelledByRestaurant': 'Cancelled'
    };
    return statusMap[status] || status;
  }
}
