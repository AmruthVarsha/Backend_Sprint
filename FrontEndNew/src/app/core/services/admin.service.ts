import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface AdminDashboardDto {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  cancelledOrders: number;
  deliveredOrders: number;
  totalUsers: number;
  activeUsers: number;
  totalRestaurants: number;
  activeRestaurants: number;
  pendingUserApprovals: number;
  pendingRestaurantApprovals: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private apiService: ApiService) {}

  getDashboardStats(): Observable<AdminDashboardDto> {
    return this.apiService.get<AdminDashboardDto>(API_ENDPOINTS.ADMIN.DASHBOARD);
  }

  // Orders
  getAllOrders(): Observable<any[]> {
    return this.apiService.get<any[]>(API_ENDPOINTS.ADMIN.ALL_ORDERS);
  }

  updateOrderStatus(id: string, status: any): Observable<any> {
    return this.apiService.put<any>(API_ENDPOINTS.ADMIN.UPDATE_ORDER_STATUS(id), status);
  }

  // Restaurants
  getAllRestaurants(): Observable<any[]> {
    return this.apiService.get<any[]>(API_ENDPOINTS.ADMIN.RESTAURANTS);
  }

  deleteRestaurant(id: string): Observable<any> {
    return this.apiService.delete<any>(API_ENDPOINTS.ADMIN.DELETE_RESTAURANT(id));
  }

  getPendingRestaurants(): Observable<any[]> {
    return this.apiService.get<any[]>(API_ENDPOINTS.ADMIN.PENDING_RESTAURANTS);
  }

  approveRestaurant(id: string): Observable<any> {
    return this.apiService.post<any>(API_ENDPOINTS.ADMIN.APPROVE_RESTAURANT_REQUEST(id), {});
  }

  rejectRestaurant(id: string): Observable<any> {
    return this.apiService.post<any>(API_ENDPOINTS.ADMIN.REJECT_RESTAURANT_REQUEST(id), {});
  }

  // Users
  getAllUsers(): Observable<any[]> {
    return this.apiService.get<any[]>(API_ENDPOINTS.ADMIN.USERS);
  }

  updateUser(id: string, dto: { fullName: string; phoneNo: string; isActive: boolean }): Observable<any> {
    return this.apiService.put<any>(API_ENDPOINTS.ADMIN.UPDATE_USER(id), dto);
  }

  deleteUser(id: string): Observable<any> {
    return this.apiService.delete<any>(API_ENDPOINTS.ADMIN.DELETE_USER(id));
  }

  getPendingUsers(): Observable<any[]> {
    return this.apiService.get<any[]>(API_ENDPOINTS.ADMIN.PENDING_USERS);
  }

  approveUser(email: string): Observable<any> {
    return this.apiService.post<any>(API_ENDPOINTS.ADMIN.APPROVE_USER_REQUEST(email), {});
  }

  rejectUser(email: string): Observable<any> {
    return this.apiService.post<any>(API_ENDPOINTS.ADMIN.REJECT_USER_REQUEST(email), {});
  }

  // Reports
  getSalesReport(from: string, to: string): Observable<any> {
    return this.apiService.get<any>(`${API_ENDPOINTS.ADMIN.SALES_REPORT}?from=${from}&to=${to}`);
  }

  getUserReport(from: string, to: string): Observable<any> {
    return this.apiService.get<any>(`${API_ENDPOINTS.ADMIN.USERS_REPORT}?from=${from}&to=${to}`);
  }

  getRestaurantReport(from: string, to: string): Observable<any> {
    return this.apiService.get<any>(`${API_ENDPOINTS.ADMIN.RESTAURANTS_REPORT}?from=${from}&to=${to}`);
  }

  // Common operations that Admin can do (proxy to other services if needed, but AdminService usually has its own)
  updateRestaurantStatus(id: string, isActive: boolean): Observable<any> {
    // Check if AdminService has this endpoint, otherwise we might need to add it to the backend first
    return this.apiService.patch<any>(API_ENDPOINTS.CATALOG.PATCH_RESTAURANT_STATUS(id), { isActive });
  }
}
