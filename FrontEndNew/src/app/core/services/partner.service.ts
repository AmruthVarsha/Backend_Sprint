import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { PartnerOrderResponseDTO, UpdateRestaurantOrderStatusDTO } from '../../shared/models/order.model';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: any; // Can be string (list view) or Address object (detail view)
  phoneNumber: string;
  email: string;
  isOpen: boolean;
  isApproved: boolean;
  logoUrl?: string;
  openingTime?: string;
  closingTime?: string;
  prepTimeMinutes?: number;
  rating?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  restaurantId: string;
  isActive: boolean;
  displayOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  restaurantId: string;
  imageUrl?: string;
  isVegetarian: boolean;
  isAvailable: boolean;
  preparationTime?: number;
}

export interface Order {
  id: string; // Guid in backend
  orderNumber: string;
  customerId: string;
  customerName: string;
  restaurantId: string; // Guid in backend
  items: OrderItem[];
  totalAmount: number;
  status: number | string;
  deliveryType: string;
  scheduledTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface DashboardStats {
  totalOrdersToday: number;
  activeOrders: number;
  totalMenuItems: number;
  restaurantStatus: boolean;
  avgPrepTime: string;
  todayRating: number;
  todayEarnings: number;
}

export interface ServiceArea {
  id: string;
  restaurantId: string;
  pincode: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PartnerService {

  // ============================================
  // SELECTED RESTAURANT STATE (shared across all partner pages)
  // ============================================

  private readonly SELECTED_RESTAURANT_KEY = 'partner_selected_restaurant_id';
  private _selectedRestaurant$ = new BehaviorSubject<Restaurant | null>(null);

  /** Observable all partner components subscribe to for the active restaurant */
  selectedRestaurant$ = this._selectedRestaurant$.asObservable();

  /** Set the active restaurant and persist choice to localStorage */
  setSelectedRestaurant(restaurant: Restaurant): void {
    localStorage.setItem(this.SELECTED_RESTAURANT_KEY, restaurant.id);
    this._selectedRestaurant$.next(restaurant);
  }

  /**
   * Silently update the in-memory value of the selected restaurant WITHOUT
   * emitting to subscribers. Use this when you only need to keep the
   * BehaviorSubject state in sync (e.g. after a field update) but do NOT
   * want to trigger the selectedRestaurant$ subscription chain.
   */
  patchSelectedRestaurant(restaurant: Restaurant): void {
    localStorage.setItem(this.SELECTED_RESTAURANT_KEY, restaurant.id);
    // Directly mutate the internal value without calling .next()
    // so no subscriber is notified.
    (this._selectedRestaurant$ as any)['_value'] = restaurant;
  }

  get currentRestaurant(): Restaurant | null {
    return this._selectedRestaurant$.getValue();
  }

  constructor(private apiService: ApiService) {}

  // ============================================
  // RESTAURANT MANAGEMENT
  // ============================================

  /**
   * Fetches ALL restaurants owned by the logged-in partner.
   * Also restores the last-selected restaurant from localStorage.
   */
  getMyRestaurants(): Observable<Restaurant[]> {
    return this.apiService.get<any[]>(API_ENDPOINTS.CATALOG.MY_RESTAURANTS).pipe(
      map(list => (list || []).map(r => ({ ...r, isOpen: r.isActive, isApproved: r.isApproved } as Restaurant))),
      tap(restaurants => {
        if (restaurants.length === 0) return;
        const savedId = localStorage.getItem(this.SELECTED_RESTAURANT_KEY);
        const toSelect = restaurants.find(r => r.id === savedId) ?? restaurants[0];
        this._selectedRestaurant$.next(toSelect);
      })
    );
  }

  /** @deprecated Use getMyRestaurants() + selectedRestaurant$ instead */
  getMyRestaurant(): Observable<Restaurant | null> {
    return this.getMyRestaurants().pipe(map(list => list[0] ?? null));
  }
  
  getRestaurantProfile(restaurantId: string): Observable<Restaurant> {
    return this.apiService.get<Restaurant>(API_ENDPOINTS.CATALOG.RESTAURANT_BY_ID(restaurantId));
  }

  updateRestaurant(restaurantId: string, restaurant: Restaurant): Observable<Restaurant> {
    return this.apiService.put<Restaurant>(API_ENDPOINTS.CATALOG.UPDATE_RESTAURANT(restaurantId), restaurant);
  }

  /** PATCH only the open/closed status — no other fields required. */
  patchRestaurantStatus(restaurantId: string, isOpen: boolean): Observable<void> {
    return this.apiService.patch<void>(API_ENDPOINTS.CATALOG.PATCH_RESTAURANT_STATUS(restaurantId), { isOpen });
  }

  createRestaurant(restaurantDto: any): Observable<string> {
    return this.apiService.post<string>(API_ENDPOINTS.CATALOG.CREATE_RESTAURANT, restaurantDto);
  }

  getCuisines(): Observable<any[]> {
    return this.apiService.get<any[]>(API_ENDPOINTS.CATALOG.CUISINES);
  }

  // ============================================
  // CATEGORY MANAGEMENT
  // ============================================
  
  getCategories(restaurantId: string): Observable<Category[]> {
    return this.apiService.get<Category[]>(API_ENDPOINTS.CATALOG.CATEGORIES_BY_RESTAURANT(restaurantId));
  }

  createCategory(category: Partial<Category>): Observable<string> {
    return this.apiService.post<string>(API_ENDPOINTS.CATALOG.CREATE_CATEGORY, category);
  }

  updateCategory(categoryId: string, category: Category): Observable<void> {
    return this.apiService.put<void>(API_ENDPOINTS.CATALOG.UPDATE_CATEGORY(categoryId), category);
  }

  toggleCategoryStatus(categoryId: string, isActive: boolean): Observable<void> {
    return this.apiService.patch<void>(API_ENDPOINTS.CATALOG.TOGGLE_CATEGORY_STATUS(categoryId), { isActive });
  }

  deleteCategory(id: string): Observable<void> {
    return this.apiService.delete<void>(API_ENDPOINTS.CATALOG.DELETE_CATEGORY(id));
  }

  // ============================================
  // MENU ITEM MANAGEMENT
  // ============================================
  
  getMenuItems(restaurantId: string): Observable<MenuItem[]> {
    return this.apiService.get<any[]>(API_ENDPOINTS.CATALOG.MENU_ITEMS_BY_RESTAURANT(restaurantId)).pipe(
      map(items => (items || []).map(item => ({
        ...item,
        isVegetarian: item.isVeg,
        preparationTime: item.prepTimeMinutes
      } as MenuItem)))
    );
  }

  getMenuItemById(id: string): Observable<MenuItem> {
    return this.apiService.get<MenuItem>(API_ENDPOINTS.CATALOG.MENU_ITEM_BY_ID(id));
  }

  createMenuItem(menuItem: Partial<MenuItem>): Observable<string> {
    return this.apiService.post<string>(API_ENDPOINTS.CATALOG.CREATE_MENU_ITEM, menuItem);
  }

  updateMenuItem(menuItemId: string, menuItem: MenuItem): Observable<void> {
    return this.apiService.put<void>(API_ENDPOINTS.CATALOG.UPDATE_MENU_ITEM(menuItemId), menuItem);
  }

  deleteMenuItem(id: string): Observable<void> {
    return this.apiService.delete<void>(API_ENDPOINTS.CATALOG.DELETE_MENU_ITEM(id));
  }

  // ============================================
  // ORDER MANAGEMENT (Sub-orders per restaurant)
  // ============================================

  /** Partner: get all sub-orders for their restaurant. */
  getRestaurantSubOrders(restaurantId: string): Observable<PartnerOrderResponseDTO[]> {
    return this.apiService.get<PartnerOrderResponseDTO[]>(
      API_ENDPOINTS.RESTAURANT_ORDER.BY_RESTAURANT(restaurantId)
    );
  }

  /** Partner: get a specific sub-order. */
  getSubOrderById(restaurantId: string, subOrderId: string): Observable<PartnerOrderResponseDTO> {
    return this.apiService.get<PartnerOrderResponseDTO>(
      API_ENDPOINTS.RESTAURANT_ORDER.SUB_ORDER_BY_ID(restaurantId, subOrderId)
    );
  }

  /**
   * Partner: update sub-order status.
   * Valid transitions: Pending→Accepted, Accepted→Preparing, Preparing→ReadyForPickup
   * Also: Rejected (from Pending), Cancelled (from Accepted/Preparing)
   */
  updateSubOrderStatus(
    restaurantId: string,
    subOrderId: string,
    dto: UpdateRestaurantOrderStatusDTO
  ): Observable<PartnerOrderResponseDTO> {
    return this.apiService.patch<PartnerOrderResponseDTO>(
      API_ENDPOINTS.RESTAURANT_ORDER.UPDATE_STATUS(restaurantId, subOrderId),
      dto
    );
  }

  // ============================================
  // SERVICE AREA MANAGEMENT
  // ============================================

  /** Get all pincodes a restaurant delivers to. */
  getServiceAreas(restaurantId: string): Observable<ServiceArea[]> {
    return this.apiService.get<ServiceArea[]>(
      API_ENDPOINTS.CATALOG.SERVICE_AREAS_BY_RESTAURANT(restaurantId)
    );
  }

  /** Add a pincode to the restaurant's service area. */
  addServiceArea(restaurantId: string, pincode: string): Observable<string> {
    return this.apiService.post<string>(API_ENDPOINTS.CATALOG.ADD_SERVICE_AREA, {
      restaurantId,
      pincode
    });
  }

  /** Remove a pincode from the restaurant's service area. */
  removeServiceArea(id: string): Observable<void> {
    return this.apiService.delete<void>(API_ENDPOINTS.CATALOG.REMOVE_SERVICE_AREA(id));
  }

  // ============================================
  // DASHBOARD STATS
  // ============================================

  getDashboardStats(restaurantId: string): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>(`/gateway/partner/dashboard/stats/${restaurantId}`);
  }
}
