import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  supportData = {
    name: '',
    email: '',
    concern: ''
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.supportData.name || !this.supportData.email || !this.supportData.concern) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.submitSupport(this.supportData).subscribe({
      next: (response) => {
        this.successMessage = 'Your request has been submitted. We will contact you soon.';
        this.supportData = { name: '', email: '', concern: '' };
        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to submit request. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
