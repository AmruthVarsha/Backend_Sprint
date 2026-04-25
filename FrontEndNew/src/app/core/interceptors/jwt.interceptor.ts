import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * JWT Interceptor
 * 
 * Automatically adds the JWT token to the Authorization header of every HTTP request.
 * This is a functional interceptor (modern Angular approach).
 * 
 * How it works:
 * 1. Gets the access token from AuthService
 * 2. Clones the request and adds Authorization header
 * 3. Passes the modified request to the next handler
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // If token exists, clone the request and add Authorization header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Pass the request to the next handler
  return next(req);
};
