import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { RoleEnum } from './shared/models/auth.model';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'customer',
    loadChildren: () => import('./features/customer/customer.routes').then(m => m.CUSTOMER_ROUTES)
    // No auth guard - publicly accessible
  },
  {
    path: 'partner',
    loadChildren: () => import('./features/partner/partner.routes').then(m => m.PARTNER_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleEnum.Partner, RoleEnum.Admin] }
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleEnum.Admin] }
  },
  // Uncomment this route when the delivery module is implemented
  // {
  //   path: 'delivery',
  //   loadChildren: () => import('./features/delivery/delivery.routes').then(m => m.DELIVERY_ROUTES),
  // },
  {
    path: '',
    redirectTo: '/customer/dashboard',
    pathMatch: 'full'
  }
];
