import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeliveryService } from '../../../core/services/delivery.service';
import { AgentProfileResponseDTO, UpsertAgentProfileDTO } from '../../../shared/models/order.model';

@Component({
  selector: 'app-delivery-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-profile.html',
  styleUrl: './delivery-profile.css',
})
export class DeliveryProfile implements OnInit, OnDestroy {

  profile: AgentProfileResponseDTO | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  // Form fields
  agentNameInput = '';
  pincodeInput = '';
  isActiveInput = false;

  private destroy$ = new Subject<void>();

  constructor(
    private deliveryService: DeliveryService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Subscribe to the reactive profile subject
    this.deliveryService.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(p => {
        if (p) {
          this.profile = p;
          if (p.id) {
            this.agentNameInput = p.agentName || '';
            this.pincodeInput = p.currentPincode || '';
            this.isActiveInput = p.isActive;
          }
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  saveProfile(): void {
    if (!this.agentNameInput.trim()) {
      this.errorMessage = 'Please enter your full name.';
      return;
    }
    if (!this.pincodeInput.trim()) {
      this.errorMessage = 'Please enter your service pincode.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const dto: UpsertAgentProfileDTO = {
      agentName: this.agentNameInput.trim(),
      currentPincode: this.pincodeInput.trim(),
      isActive: this.isActiveInput
    };

    this.deliveryService.upsertProfile(dto).pipe(takeUntil(this.destroy$)).subscribe({
      next: (p) => {
        this.profile = p;
        this.agentNameInput = p.agentName;
        this.pincodeInput = p.currentPincode;
        this.isActiveInput = p.isActive;
        this.isSaving = false;
        this.successMessage = 'Profile updated! You will now be auto-assigned orders in pincode ' + p.currentPincode + '.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to save profile. Make sure all fields are valid.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  goOnline(): void {
    this.isActiveInput = true;
    this.saveProfile();
  }

  goOffline(): void {
    this.isActiveInput = false;
    this.saveProfile();
  }
}
