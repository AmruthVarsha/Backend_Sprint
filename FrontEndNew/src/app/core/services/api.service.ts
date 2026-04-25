import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * API Service
 * 
 * Base service for all HTTP requests to the backend.
 * Handles GET, POST, PUT, DELETE requests with automatic error handling.
 * 
 * Usage:
 *   this.api.get<User>('/api/Auth/Me');
 *   this.api.post<LoginResponse>('/api/Auth/Login', loginData);
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private readonly baseUrl = environment.apiUrl;
  private readonly apiTimeout = environment.apiTimeout;

  constructor(private http: HttpClient) { }

  /**
   * GET request
   * @param endpoint - API endpoint (e.g., '/api/Auth/Me')
   * @param params - Optional query parameters
   * @returns Observable of type T
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.get<T>(url, { params })
      .pipe(
        timeout(this.apiTimeout),
        catchError(this.handleError)
      );
  }

  /**
   * POST request
   * @param endpoint - API endpoint (e.g., '/api/Auth/Login')
   * @param body - Request body
   * @returns Observable of type T
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.post<T>(url, body)
      .pipe(
        timeout(this.apiTimeout),
        catchError(this.handleError)
      );
  }

  /**
   * PUT request
   * @param endpoint - API endpoint (e.g., '/api/Auth/ChangePassword')
   * @param body - Request body
   * @returns Observable of type T
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.put<T>(url, body)
      .pipe(
        timeout(this.apiTimeout),
        catchError(this.handleError)
      );
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint (e.g., '/api/Restaurant/123')
   * @returns Observable of type T
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.delete<T>(url)
      .pipe(
        timeout(this.apiTimeout),
        catchError(this.handleError)
      );
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @returns Observable of type T
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.patch<T>(url, body)
      .pipe(
        timeout(this.apiTimeout),
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors
   * @param error - HttpErrorResponse
   * @returns Observable that throws an error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      } else {
        // Try to extract error message from response
        errorMessage = error.error?.message || error.message || `Server Error: ${error.status}`;
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
