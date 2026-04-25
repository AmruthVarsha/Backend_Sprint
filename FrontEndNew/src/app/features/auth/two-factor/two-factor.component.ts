import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
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
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Get email from storage or use a placeholder
    const email = ''; // Email should be stored during login flow
    
    this.authService.sendTwoFactorOTP(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Verification code resent!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to resend code. Please try again.';
      }
    });
  }

  onSubmit(): void {
    if (this.twoFactorForm.invalid) {
      this.errorMessage = 'Please enter a valid 6-digit code';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const verifyData = {
      email: '', // Email should be stored during login flow
      otp: this.twoFactorForm.value.code
    };

    this.authService.verifyTwoFactorOTP(verifyData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Verification successful!';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid verification code. Please try again.';
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
