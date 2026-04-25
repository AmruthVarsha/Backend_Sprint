import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
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
    private storage: StorageService
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
    return this.api.post<LoginResponseDTO>(API_ENDPOINTS.AUTH.LOGIN, credentials)
      .pipe(
        tap(response => {
          // If token is null, 2FA is required
          if (response.token) {
            this.handleAuthSuccess(response);
          }
        })
      );
  }

  /**
   * Verify Two-Factor OTP
   */
  verifyTwoFactorOTP(data: ConfirmEmailDTO): Observable<LoginResponseDTO> {
    return this.api.post<LoginResponseDTO>(API_ENDPOINTS.AUTH.VERIFY_OTP, data)
      .pipe(
        tap(response => {
          if (response.token) {
            this.handleAuthSuccess(response);
          }
        })
      );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.LOGOUT, {})
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
    return this.api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, email);
  }

  /**
   * Reset Password
   */
  resetPassword(data: ResetPasswordDTO): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
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
    return this.api.post(API_ENDPOINTS.AUTH.SEND_EMAIL_CONFIRMATION_OTP, {});
  }

  /**
   * Confirm Email with OTP
   */
  confirmEmail(otp: string): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.CONFIRM_EMAIL, otp);
  }

  /**
   * Enable/Disable Two-Factor Authentication
   */
  setTwoFactorAuth(enable: boolean): Observable<any> {
    return this.api.put(API_ENDPOINTS.AUTH.SET_TWO_FACTOR_AUTH, enable);
  }

  /**
   * Send Two-Factor OTP
   */
  sendTwoFactorOTP(email: string): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.TWO_FACTOR_AUTH, email);
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: LoginResponseDTO): void {
    if (response.token) {
      // Store access token
      this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.token);
      
      // Decode token to get user info
      const decodedToken = this.decodeToken(response.token);
      
      // Fetch full user profile
      this.getProfile().subscribe();
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    this.storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.storage.removeItem(STORAGE_KEYS.USER_INFO);
    this.currentUserSubject.next(null);
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
