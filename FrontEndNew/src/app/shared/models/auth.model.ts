/**
 * Authentication Models
 * 
 * TypeScript interfaces for authentication-related data.
 * These match your backend DTOs.
 */

/**
 * Login Request DTO
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Login Response DTO
 */
export interface LoginResponseDTO {
  token: string | null;  // JWT access token (null if 2FA required)
  refreshToken: RefreshTokenDTO;
  message?: string;
}

/**
 * Refresh Token DTO
 */
export interface RefreshTokenDTO {
  token: string;
  expiresAt: Date;
}

/**
 * Registration Request DTO
 */
export interface RegistrationDTO {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: RoleEnum;
}

/**
 * User Role Enum (matches backend)
 */
export enum RoleEnum {
  Customer = 0,
  Partner = 1,
  DeliveryAgent = 2,
  Admin = 3
}

/**
 * Confirm Email DTO
 */
export interface ConfirmEmailDTO {
  email: string;
  otp: string;
}

/**
 * Change Password DTO
 */
export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

/**
 * Reset Password DTO
 */
export interface ResetPasswordDTO {
  email: string;
  token: string;
  newPassword: string;
}

/**
 * Decoded JWT Token
 * Contains user information extracted from the JWT
 */
export interface DecodedToken {
  email: string;
  role: string;
  name: string;
  exp: number;  // Expiration timestamp
  iat: number;  // Issued at timestamp
}
