import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Confirm Email Component
 * 
 * Allows users to verify their email address by entering a 6-digit OTP.
 * The OTP is sent to the user's email when they click "Send Verification Email" in their profile.
 */
@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css'
})
export class ConfirmEmailComponent implements OnInit {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;
  
  confirmEmailForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  code: string[] = ['', '', '', '', '', ''];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // Check if user is authenticated
    if (!this.authService.isAuthenticated) {
      console.warn('[ConfirmEmail] User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }
  }

  initializeForm(): void {
    this.confirmEmailForm = this.fb.group({
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
    this.confirmEmailForm.patchValue({
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

    this.confirmEmailForm.patchValue({
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
    console.log('[ConfirmEmail] Resending email confirmation OTP');
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.authService.sendEmailConfirmationOTP().subscribe({
      next: () => {
        console.log('[ConfirmEmail] OTP resent successfully');
        this.isLoading = false;
        this.successMessage = 'Verification code resent to your email!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        console.error('[ConfirmEmail] Failed to resend OTP:', error);
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
    if (this.confirmEmailForm.invalid) {
      this.errorMessage = 'Please enter a valid 6-digit code';
      return;
    }

    console.log('[ConfirmEmail] Submitting email confirmation');
    console.log('[ConfirmEmail] OTP:', this.confirmEmailForm.value.code);
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const otp = this.confirmEmailForm.value.code;

    this.authService.confirmEmail(otp).subscribe({
      next: () => {
        console.log('[ConfirmEmail] Email confirmed successfully');
        this.isLoading = false;
        this.successMessage = 'Email confirmed successfully! Updating your session...';
        
        // Refresh token to update the EmailConfirmed claim in the JWT
        this.authService.refreshToken().subscribe({
          next: () => {
            // Update the user profile locally
            this.authService.getProfile().subscribe({
              next: () => {
                setTimeout(() => {
                  this.router.navigate(['/customer/profile']);
                }, 1500);
              },
              error: () => {
                setTimeout(() => {
                  this.router.navigate(['/customer/profile']);
                }, 1500);
              }
            });
          },
          error: (err) => {
            console.error('[ConfirmEmail] Token refresh failed:', err);
            // Even if refresh fails, attempt to update profile and redirect
            this.authService.getProfile().subscribe({
              next: () => this.router.navigate(['/customer/profile']),
              error: () => this.router.navigate(['/customer/profile'])
            });
          }
        });
      },
      error: (error: any) => {
        console.error('[ConfirmEmail] Email confirmation failed:', error);
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
        this.codeInputs.forEach(input => {
          input.nativeElement.value = '';
        });
        this.codeInputs.first.nativeElement.focus();
      }
    });
  }
}
