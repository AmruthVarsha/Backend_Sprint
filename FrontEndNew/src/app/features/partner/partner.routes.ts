import { Routes } from '@angular/router';

export const PARTNER_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.PartnerDashboardComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.component').then(m => m.PartnerOrdersComponent)
  },
  {
    path: 'menu-items',
    loadComponent: () => import('./menu-items/menu-items.component').then(m => m.PartnerMenuItemsComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./categories/categories.component').then(m => m.PartnerCategoriesComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.PartnerSettingsComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];