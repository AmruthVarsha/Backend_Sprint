import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'pending-approvals',
    loadComponent: () => import('./pending-approvals/pending-approvals.component').then(m => m.AdminPendingApprovalsComponent)
  },
  {
    path: 'user-management',
    loadComponent: () => import('./user-management/user-management.component').then(m => m.AdminUserManagementComponent)
  },
  {
    path: 'restaurant-management',
    loadComponent: () => import('./restaurant-management/restaurant-management.component').then(m => m.AdminRestaurantManagementComponent)
  },
  {
    path: 'order-management',
    loadComponent: () => import('./order-management/order-management.component').then(m => m.AdminOrderManagementComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports.component').then(m => m.AdminReportsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('../customer/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];