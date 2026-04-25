import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Error Interceptor
 * 
 * Handles HTTP errors globally.
 * - 401 Unauthorized: Logout and redirect to login
 * - 403 Forbidden: Show access denied message
 * - Other errors: Pass through for component handling
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (error.status === 401) {
        // Unauthorized - Token expired or invalid
        console.warn('Unauthorized request. Logging out...');
        authService.logout().subscribe(() => {
          router.navigate(['/auth/login']);
        });
      }

      if (error.status === 403) {
        // Forbidden - User doesn't have permission
        console.warn('Access denied. Insufficient permissions.');
      }

      // Pass the error to the component for specific handling
      return throwError(() => error);
    })
  );
};
