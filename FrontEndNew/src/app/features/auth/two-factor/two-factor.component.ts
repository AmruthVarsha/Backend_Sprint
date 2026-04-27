import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './two-factor.component.html',
  styleUrl: './two-factor.component.css'
})
export class TwoFactorComponent implements OnInit {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;
  
  twoFactorForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  code: string[] = ['', '', '', '', '', ''];
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get email from query params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      console.log('[TwoFactor] Email from query params:', this.email);
      
      if (!this.email) {
        // If no email, redirect back to login
        console.warn('[TwoFactor] No email provided, redirecting to login');
        this.router.navigate(['/auth/login']);
        return;
      }
      
      // Automatically send OTP when page loads
      console.log('[TwoFactor] Automatically sending OTP to:', this.email);
      this.sendOTPOnLoad();
    });
    
    this.initializeForm();
  }

  /**
   * Send OTP automatically when page loads
   */
  private sendOTPOnLoad(): void {
    console.log('[TwoFactor] sendOTPOnLoad called');
    this.authService.sendTwoFactorOTP(this.email).subscribe({
      next: () => {
        console.log('[TwoFactor] OTP sent successfully on page load');
        this.successMessage = 'Verification code sent to your email!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        console.error('[TwoFactor] Failed to send OTP on page load:', error);
        // Don't show error on auto-send, user can click resend if needed
        // The OTP might have already been sent during login
      }
    });
  }

  initializeForm(): void {
    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  onCodeInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only allow digits
    if (!/^\d*$/.test(value)) {
      input.value = '';
      return;
    }

    this.code[index] = value;

    // Move to next input if value is entered
    if (value && index < 5) {
      const nextInput = this.codeInputs.toArray()[index + 1];
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }

    // Update form value
    this.twoFactorForm.patchValue({
      code: this.code.join('')
    });

    // Auto-submit when all 6 digits are entered
    if (this.code.every(digit => digit !== '') && this.code.join('').length === 6) {
      this.onSubmit();
    }
  }

  onCodeKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    // Handle backspace
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = this.codeInputs.toArray()[index - 1];
      if (prevInput) {
        prevInput.nativeElement.focus();
        this.code[index - 1] = '';
      }
    }

    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = this.codeInputs.toArray()[index - 1];
      if (prevInput) {
        prevInput.nativeElement.focus();
      }
    }

    if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = this.codeInputs.toArray()[index + 1];
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }
  }

  onCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    digits.forEach((digit, index) => {
      if (index < 6) {
        this.code[index] = digit;
        const input = this.codeInputs.toArray()[index];
        if (input) {
          input.nativeElement.value = digit;
        }
      }
    });

    this.twoFactorForm.patchValue({
      code: this.code.join('')
    });

    // Focus last filled input or first empty
    const lastIndex = Math.min(digits.length, 5);
    const targetInput = this.codeInputs.toArray()[lastIndex];
    if (targetInput) {
      targetInput.nativeElement.focus();
    }
  }

  resendCode(): void {
    if (!this.email) {
      this.errorMessage = 'Email not found. Please login again.';
      return;
    }

    console.log('[TwoFactor] Resending OTP to:', this.email);
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.authService.sendTwoFactorOTP(this.email).subscribe({
      next: () => {
        console.log('[TwoFactor] OTP resent successfully');
        this.isLoading = false;
        this.successMessage = 'Verification code resent!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        console.error('[TwoFactor] Failed to resend OTP:', error);
        this.isLoading = false;
        
        let errorMsg = 'Failed to resend code. Please try again.';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error.message) {
            errorMsg = error.error.message;
          } else if (error.error.title) {
            errorMsg = error.error.title;
          }
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        this.errorMessage = errorMsg;
      }
    });
  }

  onSubmit(): void {
    if (this.twoFactorForm.invalid) {
      this.errorMessage = 'Please enter a valid 6-digit code';
      return;
    }

    if (!this.email) {
      this.errorMessage = 'Email not found. Please login again.';
      return;
    }

    console.log('[TwoFactor] Submitting OTP verification');
    console.log('[TwoFactor] Email:', this.email);
    console.log('[TwoFactor] OTP:', this.twoFactorForm.value.code);
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const verifyData = {
      email: this.email,
      otp: this.twoFactorForm.value.code
    };

    this.authService.verifyTwoFactorOTP(verifyData).subscribe({
      next: (response) => {
        console.log('[TwoFactor] Verification successful:', response);
        this.isLoading = false;
        this.successMessage = 'Verification successful! Redirecting...';
        
        // Wait for profile to load, then redirect based on role
        const userSub = this.authService.currentUser$.subscribe(user => {
          console.log('[TwoFactor] Current user:', user);
          if (user) {
            setTimeout(() => {
              this.redirectBasedOnRole(user.role);
              userSub.unsubscribe();
            }, 1000);
          }
        });
        
        // Fallback timeout
        setTimeout(() => {
          const currentUser = this.authService.currentUserValue;
          if (!currentUser) {
            console.warn('[TwoFactor] Profile not loaded, redirecting to dashboard anyway');
            this.router.navigate(['/customer/dashboard']);
            userSub.unsubscribe();
          }
        }, 3000);
      },
      error: (error: any) => {
        console.error('[TwoFactor] Verification failed:', error);
        this.isLoading = false;
        
        let errorMsg = 'Invalid verification code. Please try again.';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error.message) {
            errorMsg = error.error.message;
          } else if (error.error.title) {
            errorMsg = error.error.title;
          }
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        this.errorMessage = errorMsg;
        
        // Clear the code inputs
        this.code = ['', '', '', '', '', ''];
        this.twoFactorForm.patchValue({ code: '' });
        
        // Use setTimeout to ensure DOM is updated before focusing
        setTimeout(() => {
          this.codeInputs.forEach(input => {
            input.nativeElement.value = '';
          });
          if (this.codeInputs.first) {
            this.codeInputs.first.nativeElement.focus();
          }
        });
      }
    });
  }

  /**
   * Redirect user based on their role
   */
  private redirectBasedOnRole(role: string | number): void {
    // Convert string role to number if needed
    let roleNum: number;
    
    if (typeof role === 'string') {
      const roleMap: { [key: string]: number } = {
        'Customer': 0,
        'Partner': 1,
        'DeliveryAgent': 2,
        'Delivery Agent': 2,
        'Admin': 3
      };
      roleNum = roleMap[role] ?? 0;
    } else {
      roleNum = role;
    }
    
    switch (roleNum) {
      case 0: // Customer
        this.router.navigate(['/customer/dashboard']);
        break;
      case 1: // Partner
        this.router.navigate(['/partner/dashboard']);
        break;
      case 2: // DeliveryAgent
        this.router.navigate(['/delivery/dashboard']);
        break;
      case 3: // Admin
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/customer/dashboard']);
    }
  }
}
