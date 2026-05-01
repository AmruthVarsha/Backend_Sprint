import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { CacheService } from '../services/cache.service';

/**
 * Cache Interceptor
 * 
 * Automatically caches GET requests to improve performance and reduce server load.
 * Invalidates cache for related endpoints when data-modifying requests (POST, PUT, DELETE) are made.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);
  
  // Real-time operational data that should NEVER be cached
  const NO_CACHE_PATTERNS = [
    '/assignments',
    '/profile', // Specifically for delivery agent status
    '/cart',
    '/status'
  ];

  const shouldCache = (url: string) => {
    return !NO_CACHE_PATTERNS.some(pattern => url.toLowerCase().includes(pattern));
  };

  // 1. Only cache GET requests
  if (req.method !== 'GET') {
    // For non-GET requests, we should consider invalidating related cache
    // e.g., if we POST to /api/orders, we should clear the cache for /api/orders (GET)
    return next(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Extract the base endpoint (e.g., 'orders' from '/api/orders/123')
          const urlParts = req.url.split('/');
          const baseEndpoint = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
          if (baseEndpoint) {
            cacheService.invalidatePattern(baseEndpoint);
          }
        }
      })
    );
  }

  // 2. Check if we have a cached version
  const cachedResponse = shouldCache(req.url) ? cacheService.get(req.urlWithParams) : null;
  if (cachedResponse) {
    console.log(`[CacheInterceptor] Serving cached response for: ${req.urlWithParams}`);
    return of(cachedResponse.clone());
  }

  // 3. If not cached, make the request and cache the result
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && shouldCache(req.url)) {
        console.log(`[CacheInterceptor] Caching response for: ${req.urlWithParams}`);
        cacheService.put(req.urlWithParams, event);
      }
    })
  );
};
