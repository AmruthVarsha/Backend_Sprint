import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phoneNumber: string;
  email: string;
  isOpen: boolean;
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
      map(list => (list || []).map(r => ({ ...r, isOpen: r.isActive } as Restaurant))),
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
  // ORDER MANAGEMENT
  // ============================================
  
  getRestaurantOrders(): Observable<Order[]> {
    // Backend filters orders by user role (Partner) automatically
    return this.apiService.get<any[]>(API_ENDPOINTS.ORDER.ORDERS).pipe(
      map(orders => orders.map(o => ({
        ...o,
        orderNumber: o.id.substring(0, 8).toUpperCase(),
        customerName: 'Customer', // Backend OrderResponseDTO doesn't include customer name yet
        items: o.items ? o.items.map((i: any) => ({
          id: i.id,
          menuItemId: i.menuItemId,
          name: i.menuItemName,
          quantity: i.quantity,
          price: i.unitPrice
        })) : []
      } as Order)))
    );
  }

  getOrderById(id: string): Observable<Order> {
    return this.apiService.get<Order>(API_ENDPOINTS.ORDER.ORDER_BY_ID(id));
  }

  updateOrderStatus(orderId: string, status: number): Observable<void> {
    return this.apiService.put<void>(API_ENDPOINTS.ORDER.UPDATE_ORDER_STATUS(orderId), { status });
  }

  // ============================================
  // DASHBOARD STATS
  // ============================================
  
  getDashboardStats(restaurantId: string): Observable<DashboardStats> {
    // TODO: Replace with actual endpoint when available
    // For now, calculate from orders
    return this.apiService.get<DashboardStats>(`/gateway/partner/dashboard/stats/${restaurantId}`);
  }
}
