import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'restaurant/:id',
    loadComponent: () => import('./restaurant-detail/restaurant-detail.component').then(m => m.RestaurantDetailComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: 'order-tracking/:id',
    loadComponent: () => import('./order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'support',
    loadComponent: () => import('./support/support.component').then(m => m.SupportComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
