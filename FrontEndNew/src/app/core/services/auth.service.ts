import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { CartService } from './cart.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { 
  LoginDTO, 
  LoginResponseDTO, 
  RegistrationDTO, 
  ChangePasswordDTO,
  ResetPasswordDTO,
  ConfirmEmailDTO,
  DecodedToken 
} from '../../shared/models/auth.model';
import { ProfileDTO } from '../../shared/models/user.model';

/**
 * Auth Service
 * 
 * Manages user authentication state and operations.
 * Handles login, register, logout, token management, and user state.
 * 
 * Usage:
 *   authService.login(credentials);
 *   authService.isAuthenticated$; // Observable<boolean>
 *   authService.currentUser$; // Observable<ProfileDTO | null>
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // BehaviorSubject holds the current user state
  // It's like a variable that notifies subscribers when it changes
  private currentUserSubject = new BehaviorSubject<ProfileDTO | null>(null);
  
  // Public Observable that components can subscribe to
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Observable that emits true if user is logged in, false otherwise
  public isAuthenticated$ = this.currentUser$.pipe(
    map(user => user !== null)
  );

  constructor(
    private api: ApiService,
    private storage: StorageService,
    private cartService: CartService
  ) {
    // On service initialization, check if user is already logged in
    this.loadUserFromStorage();
  }

  /**
   * Get current user value (synchronous)
   */
  get currentUserValue(): ProfileDTO | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated (synchronous)
   */
  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null && this.hasValidToken();
  }

  /**
   * Get current user's role
   */
  get userRole(): string | null {
    return this.currentUserValue?.role?.toString() || null;
  }

  /**
   * Register a new user
   */
  register(data: RegistrationDTO): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.REGISTER, data);
  }

  /**
   * Login user
   */
  login(credentials: LoginDTO): Observable<LoginResponseDTO> {
    console.log('[AuthService] login() called with:', { email: credentials.email, password: '***' });
    console.log('[AuthService] API endpoint:', API_ENDPOINTS.AUTH.LOGIN);
    
    // Backend now returns consistent JSON response
    return this.api.post<LoginResponseDTO>(API_ENDPOINTS.AUTH.LOGIN, credentials)
      .pipe(
        tap(response => {
          console.log('[AuthService] Login response received:', response);
          console.log('[AuthService] requireTwoFactor:', response.requireTwoFactor);
          console.log('[AuthService] token:', response.token ? 'present' : 'null');
          
          // Only handle auth success if token is present and 2FA is not required
          if (response.token && !response.requireTwoFactor) {
            console.log('[AuthService] Token found and no 2FA required, handling auth success');
            this.handleAuthSuccess(response);
          } else if (response.requireTwoFactor) {
            console.log('[AuthService] 2FA required - not handling auth yet');
          } else {
            console.log('[AuthService] No token and no 2FA flag - unexpected state');
          }
        }),
        catchError(error => {
          console.error('[AuthService] Login error:', error);
          throw error;
        })
      );
  }

  /**
   * Verify Two-Factor OTP
   */
  verifyTwoFactorOTP(data: { email: string; otp: string }): Observable<any> {
    console.log('[AuthService] verifyTwoFactorOTP called with:', { email: data.email, otp: '***' });
    
    // Backend expects 'token' field, not 'otp'
    const requestData = {
      email: data.email,
      token: data.otp  // Map otp to token
    };
    
    console.log('[AuthService] Sending request with:', { email: requestData.email, token: '***' });
    
    // Request text response to handle both JSON and plain text responses
    return this.api.post<any>(API_ENDPOINTS.AUTH.VERIFY_OTP, requestData, { responseType: 'text' })
      .pipe(
        map(response => {
          console.log('[AuthService] Verify OTP raw response:', response);
          
          // Try to parse as JSON first
          if (typeof response === 'string') {
            try {
              const parsed = JSON.parse(response);
              console.log('[AuthService] Parsed JSON:', parsed);
              return parsed;
            } catch (e) {
              console.log('[AuthService] Not JSON, returning as string');
              return response;
            }
          }
          
          return response;
        }),
        tap(response => {
          console.log('[AuthService] Verify OTP processed response:', response);
          
          // If response has token, handle auth success
          if (response && typeof response === 'object' && response.token) {
            console.log('[AuthService] Token found in verify response, handling auth success');
            this.handleAuthSuccess(response);
          }
        }),
        catchError(error => {
          console.error('[AuthService] Verify OTP error:', error);
          throw error;
        })
      );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.LOGOUT, {}, { responseType: 'text' })
      .pipe(
        tap(() => this.clearAuthData()),
        catchError(() => {
          // Even if API call fails, clear local data
          this.clearAuthData();
          return of(null);
        })
      );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<LoginResponseDTO> {
    return this.api.post<LoginResponseDTO>(API_ENDPOINTS.AUTH.REFRESH, {})
      .pipe(
        tap(response => {
          if (response.token) {
            this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.token);
          }
        })
      );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<ProfileDTO> {
    return this.api.get<ProfileDTO>(API_ENDPOINTS.AUTH.ME)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.storage.setItem(STORAGE_KEYS.USER_INFO, user);
        })
      );
  }

  /**
   * Forgot Password - Send reset email
   */
  forgotPassword(email: string): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, `"${email}"`, { responseType: 'text' });
  }

  /**
   * Reset Password
   */
  resetPassword(data: ResetPasswordDTO): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data, { responseType: 'text' });
  }

  /**
   * Change Password
   */
  changePassword(data: ChangePasswordDTO): Observable<any> {
    return this.api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  }

  /**
   * Send Email Confirmation OTP
   */
  sendEmailConfirmationOTP(): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.SEND_EMAIL_CONFIRMATION_OTP, {}, { responseType: 'text' });
  }

  /**
   * Confirm Email with OTP
   */
  confirmEmail(otp: string): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.CONFIRM_EMAIL, `"${otp}"`, { responseType: 'text' });
  }

  /**
   * Enable/Disable Two-Factor Authentication
   */
  setTwoFactorAuth(enable: boolean): Observable<any> {
    return this.api.put(API_ENDPOINTS.AUTH.SET_TWO_FACTOR_AUTH, enable, { responseType: 'text' });
  }

  /**
   * Submit Support Request
   */
  submitSupport(data: { name: string; email: string; concern: string }): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.SUPPORT, data);
  }

  /**
   * Send Two-Factor OTP
   */
  sendTwoFactorOTP(email: string): Observable<any> {
    console.log('[AuthService] sendTwoFactorOTP called with email:', email);
    console.log('[AuthService] Endpoint:', API_ENDPOINTS.AUTH.TWO_FACTOR_AUTH);
    
    // Backend expects email as a JSON string in the body with Content-Type: application/json
    // We need to send it as a quoted string: "email@example.com"
    return this.api.post(API_ENDPOINTS.AUTH.TWO_FACTOR_AUTH, `"${email}"`, { responseType: 'text' });
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: LoginResponseDTO): void {
    console.log('[AuthService] handleAuthSuccess called');
    if (response.token) {
      console.log('[AuthService] Storing access token');
      // Store access token
      this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.token);
      
      // Decode token to get user info
      const decodedToken = this.decodeToken(response.token);
      console.log('[AuthService] Token decoded:', { email: decodedToken.email, role: decodedToken.role });
      
      // Fetch full user profile
      console.log('[AuthService] Fetching user profile...');
      this.getProfile().subscribe({
        next: (profile) => {
          console.log('[AuthService] Profile fetched successfully:', profile);
        },
        error: (error) => {
          console.error('[AuthService] Failed to fetch profile:', error);
        }
      });
    } else {
      console.warn('[AuthService] handleAuthSuccess called but no token present');
    }
  }

  /**
   * Clear all authentication data
   * Public method to allow error interceptor to clear auth without API call
   */
  clearAuthData(): void {
    this.storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.storage.removeItem(STORAGE_KEYS.USER_INFO);
    this.currentUserSubject.next(null);
    // Clear the cart so a different user logging in doesn't see a previous session's cart
    this.cartService.clearCart();
  }

  /**
   * Load user from storage on app initialization
   */
  private loadUserFromStorage(): void {
    const token = this.storage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
    const user = this.storage.getItem<ProfileDTO>(STORAGE_KEYS.USER_INFO);
    
    if (token && user && this.hasValidToken()) {
      this.currentUserSubject.next(user);
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Check if token exists and is not expired
   */
  private hasValidToken(): boolean {
    const token = this.storage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return false;

    try {
      const decoded = this.decodeToken(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): DecodedToken {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.storage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
  }
}
