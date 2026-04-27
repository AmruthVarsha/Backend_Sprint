import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Subject, EMPTY } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';

export interface User {
  userId: string;
  fullName: string;
  email: string;
  phoneNo: string;
  role: string;
  isActive: boolean;
  emailConfirmed: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class AdminUserManagementComponent implements OnInit, OnDestroy {

  searchQuery = '';
  selectedRole = 'all';
  isLoading = false;
  errorMessage = '';
  
  users: User[] = [];

  roleFilters = ['all', 'Customer', 'Partner', 'DeliveryAgent', 'Admin'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    
    this.adminService.getAllUsers().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to load users', err);
        this.errorMessage = 'Failed to load users.';
        this.cdr.markForCheck();
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe(data => {
      if (data) {
        this.users = data;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredUsers(): User[] {
    let filtered = this.users;
    
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(query)) || 
        (u.email && u.email.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }

  toggleUserStatus(user: User): void {
    user.isActive = !user.isActive;
    console.log(`User ${user.userId} status updated to ${user.isActive}`);
  }

  editUser(user: User): void {
    console.log('Edit user:', user.userId);
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.userId !== userId);
          this.cdr.markForCheck();
          console.log('User deleted:', userId);
        },
        error: (err) => {
          console.error('Failed to delete user', err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
