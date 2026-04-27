import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Subject, forkJoin, EMPTY } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';

export interface PendingUser {
  email: string;
  fullName: string;
  role: string;
  requestedAt: Date;
}

export interface PendingRestaurant {
  restaurantId: string;
  ownerId: string;
  restaurantName: string;
  email: string;
  phoneNumber: string;
  requestedAt: Date;
}

@Component({
  selector: 'app-admin-pending-approvals',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pending-approvals.component.html',
  styleUrls: ['./pending-approvals.component.css']
})
export class AdminPendingApprovalsComponent implements OnInit, OnDestroy {

  pendingUsers: PendingUser[] = [];
  pendingRestaurants: PendingRestaurant[] = [];
  isLoading = false;
  errorMessage = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPendingApprovals();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPendingApprovals(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    
    forkJoin({
      users: this.adminService.getPendingUsers().pipe(catchError(() => EMPTY)),
      restaurants: this.adminService.getPendingRestaurants().pipe(catchError(() => EMPTY))
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe(data => {
      if (data) {
        if (data.users) this.pendingUsers = data.users;
        if (data.restaurants) this.pendingRestaurants = data.restaurants;
        this.cdr.markForCheck();
      }
    });
  }

  approveUser(email: string): void {
    this.adminService.approveUser(email).subscribe({
      next: () => {
        this.pendingUsers = this.pendingUsers.filter(u => u.email !== email);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to approve user', err)
    });
  }

  rejectUser(email: string): void {
    if (confirm('Are you sure you want to reject this user?')) {
      this.adminService.rejectUser(email).subscribe({
        next: () => {
          this.pendingUsers = this.pendingUsers.filter(u => u.email !== email);
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Failed to reject user', err)
      });
    }
  }

  approveRestaurant(id: string): void {
    this.adminService.approveRestaurant(id).subscribe({
      next: () => {
        this.pendingRestaurants = this.pendingRestaurants.filter(r => r.restaurantId !== id);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to approve restaurant', err)
    });
  }

  rejectRestaurant(id: string): void {
    if (confirm('Are you sure you want to reject this restaurant?')) {
      this.adminService.rejectRestaurant(id).subscribe({
        next: () => {
          this.pendingRestaurants = this.pendingRestaurants.filter(r => r.restaurantId !== id);
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Failed to reject restaurant', err)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
