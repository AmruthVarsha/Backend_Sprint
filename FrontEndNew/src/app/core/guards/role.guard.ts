import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleEnum } from '../../shared/models/auth.model';

/**
 * Role Guard
 * 
 * Protects routes based on user role.
 * Checks if the user has the required role to access the route.
 * 
 * Usage in routes:
 *   { 
 *     path: 'admin', 
 *     component: AdminComponent, 
 *     canActivate: [authGuard, roleGuard],
 *     data: { roles: [RoleEnum.Admin] }
 *   }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUserValue;
  const requiredRoles = route.data['roles'] as RoleEnum[];

  const allowGuest = route.data['allowGuest'] === true;

  if (!user) {
    if (allowGuest) return true;
    // User not logged in
    router.navigate(['/auth/login']);
    return false;
  }

  if (!requiredRoles || requiredRoles.length === 0) {
    // No specific role required
    return true;
  }

  // Convert user role (string) to RoleEnum (number) for comparison
  const userRoleNum = convertRoleToEnum(user.role);

  // Check if user has one of the required roles
  if (requiredRoles.includes(userRoleNum)) {
    return true;
  }

  // User doesn't have required role
  console.warn('Access denied. Insufficient permissions.');
  router.navigate(['/']);
  return false;
};

/**
 * Helper function to convert role string to RoleEnum number
 */
function convertRoleToEnum(role: string | number): RoleEnum {
  if (typeof role === 'number') {
    return role as RoleEnum;
  }
  
  const roleMap: { [key: string]: RoleEnum } = {
    'Customer': RoleEnum.Customer,
    'Partner': RoleEnum.Partner,
    'DeliveryAgent': RoleEnum.DeliveryAgent,
    'Delivery Agent': RoleEnum.DeliveryAgent,
    'Admin': RoleEnum.Admin
  };
  
  return roleMap[role] ?? RoleEnum.Customer; // Default to Customer if unknown
}
