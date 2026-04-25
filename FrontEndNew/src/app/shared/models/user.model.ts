/**
 * User Models
 * 
 * TypeScript interfaces for user-related data.
 */

import { RoleEnum } from './auth.model';

/**
 * User Profile DTO
 */
export interface ProfileDTO {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: RoleEnum;
  isEmailConfirmed: boolean;
  isTwoFactorEnabled: boolean;
  accountStatus: AccountStatus;
  createdAt: Date;
  addresses?: AddressResponseDTO[];
}

/**
 * Account Status Enum
 */
export enum AccountStatus {
  Active = 0,
  Inactive = 1,
  Suspended = 2,
  PendingApproval = 3
}

/**
 * Address Response DTO
 */
export interface AddressResponseDTO {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

/**
 * Update Profile DTO
 */
export interface UpdateProfileDTO {
  name: string;
  phoneNumber: string;
}

/**
 * Address DTO
 */
export interface AddressDTO {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

/**
 * Update Address DTO
 */
export interface UpdateAddressDTO extends AddressDTO {
  id: number;
}
