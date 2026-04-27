import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface Restaurant {
  id: string; // Backend uses Guid
  name: string;
  description?: string;
  logoUrl?: string; // Backend field name
  rating: number;
  totalRatings: number;
  prepTimeMinutes: number; // Backend field name
  isActive: boolean;
  city: string;
  pincode: string;
  cuisines: string[]; // Backend returns array
  openingTime: string;
  closingTime: string;
  
  // Computed/display fields (not from backend)
  imageUrl?: string; // Alias for logoUrl
  cuisineType?: string; // Computed from cuisines array
  deliveryTime?: string; // Computed from prepTimeMinutes
  minimumOrder?: number; // Not in backend, can be hardcoded
  
  // For detail view (from RestaurantDetailDto)
  address?: string;
  phoneNumber?: string;
  email?: string;
}

export interface Category {
  id: string; // Backend uses Guid
  name: string;
  description: string;
  imageUrl: string;
}

export interface MenuItem {
  id: string; // Backend uses Guid
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  restaurantId: string; // Backend uses Guid
  categoryId: string; // Backend uses Guid
  categoryName?: string;
  isVeg?: boolean;
  prepTimeMinutes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private api: ApiService) { }

  // Restaurant endpoints
  getRestaurants(): Observable<Restaurant[]> {
    return this.api.get<Restaurant[]>(API_ENDPOINTS.CATALOG.RESTAURANTS);
  }

  getRestaurantById(id: string): Observable<Restaurant> {
    return this.api.get<Restaurant>(API_ENDPOINTS.CATALOG.RESTAURANT_BY_ID(id));
  }

  searchRestaurants(query: string): Observable<Restaurant[]> {
    return this.api.get<Restaurant[]>(`${API_ENDPOINTS.CATALOG.RESTAURANT_SEARCH}?query=${query}`);
  }

  // Category endpoints
  getCategoriesByRestaurant(restaurantId: string): Observable<Category[]> {
    return this.api.get<Category[]>(API_ENDPOINTS.CATALOG.CATEGORIES_BY_RESTAURANT(restaurantId));
  }

  // Menu Item endpoints
  getMenuItemById(id: string): Observable<MenuItem> {
    return this.api.get<MenuItem>(API_ENDPOINTS.CATALOG.MENU_ITEM_BY_ID(id));
  }

  getMenuItemsByRestaurant(restaurantId: string): Observable<MenuItem[]> {
    return this.api.get<MenuItem[]>(API_ENDPOINTS.CATALOG.MENU_ITEMS_BY_RESTAURANT(restaurantId));
  }

  getMenuItemsByCategory(categoryId: string): Observable<MenuItem[]> {
    return this.api.get<MenuItem[]>(API_ENDPOINTS.CATALOG.MENU_ITEMS_BY_CATEGORY(categoryId));
  }
}
