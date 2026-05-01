import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, { response: HttpResponse<any>, expiry: number }>();
  private readonly DEFAULT_TTL = 300000; // 5 minutes in milliseconds

  /**
   * Get cached response
   */
  get(url: string): HttpResponse<any> | null {
    const cached = this.cache.get(url);
    if (!cached) return null;

    const isExpired = Date.now() > cached.expiry;
    if (isExpired) {
      this.cache.delete(url);
      return null;
    }

    return cached.response;
  }

  /**
   * Set cached response
   */
  put(url: string, response: HttpResponse<any>, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(url, {
      response,
      expiry: Date.now() + ttl
    });
  }

  /**
   * Invalidate specific URL or clear all
   */
  invalidate(url?: string): void {
    if (url) {
      this.cache.delete(url);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Invalidate cache based on partial URL match
   * Useful for clearing all 'orders' cache when a new order is placed
   */
  invalidatePattern(pattern: string): void {
    const keysToInvalidate = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
    keysToInvalidate.forEach(key => this.cache.delete(key));
  }
}
