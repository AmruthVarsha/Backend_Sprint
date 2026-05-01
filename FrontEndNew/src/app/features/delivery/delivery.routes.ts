import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleEnum } from '../../shared/models/auth.model';
import { DeliveryLayoutComponent } from './delivery-layout/delivery-layout';
import { DeliveryDashboard } from './delivery-dashboard/delivery-dashboard';
import { DeliveryAssignedTasks } from './delivery-assigned-tasks/delivery-assigned-tasks';
import { DeliveryHistory } from './delivery-history/delivery-history';
import { DeliveryProfile } from './delivery-profile/delivery-profile';

export const DELIVERY_ROUTES: Routes = [
  {
    path: '',
    component: DeliveryLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleEnum.DeliveryAgent] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DeliveryDashboard },
      { path: 'tasks', component: DeliveryAssignedTasks },
      { path: 'history', component: DeliveryHistory },
      {
        path: 'profile',
        loadComponent: () => import('./delivery-profile/delivery-profile').then(m => m.DeliveryProfile)
      },
    ]
  },
  {
    path: 'account',
    loadComponent: () => import('../customer/profile/profile.component').then(m => m.ProfileComponent)
  }
];
