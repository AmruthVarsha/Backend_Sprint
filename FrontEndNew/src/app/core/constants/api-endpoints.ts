/**
 * API Endpoints
 * 
 * Centralized constants for all API endpoints.
 * Organized by service (Auth, Catalog, Order, Admin).
 */

export const API_ENDPOINTS = {
  
  // ============================================
  // AUTH SERVICE ENDPOINTS
  // ============================================
  AUTH: {
    REGISTER: '/gateway/auth/Auth/Register',
    LOGIN: '/gateway/auth/Auth/Login',
    LOGOUT: '/gateway/auth/Auth/Logout',
    REFRESH: '/gateway/auth/Auth/Refresh',
    ME: '/gateway/auth/Auth/Me',
    
    // Password Management
    FORGOT_PASSWORD: '/gateway/auth/Auth/ForgotPassword',
    RESET_PASSWORD: '/gateway/auth/Auth/ResetPassword',
    CHANGE_PASSWORD: '/gateway/auth/Auth/ChangePassword',
    
    // Email Confirmation
    SEND_EMAIL_CONFIRMATION_OTP: '/gateway/auth/Auth/SendEmailConfirmationOTP',
    CONFIRM_EMAIL: '/gateway/auth/Auth/ConfirmEmail',
    
    // Two-Factor Authentication
    SET_TWO_FACTOR_AUTH: '/gateway/auth/Auth/SetTwoFactorAuth',
    TWO_FACTOR_AUTH: '/gateway/auth/Auth/TwoFactorAuth',
    VERIFY_OTP: '/gateway/auth/Auth/VerifyOTP',
    
    // Admin Only
    PROMOTE_ROLE: '/gateway/auth/Auth/PromoteRole',
    CHANGE_ACCOUNT_STATUS: '/gateway/auth/Auth/ChangeAccountStatus',
    PENDING_REQUESTS: '/gateway/auth/Auth/PendingRequests',
    APPROVE_REQUEST: (email: string) => `/gateway/auth/Auth/ApproveRequest/${email}`,
  },

  // ============================================
  // USER SERVICE ENDPOINTS
  // ============================================
  USER: {
    // Profile Management
    GET_PROFILE: '/gateway/auth/User',
    UPDATE_PROFILE: '/gateway/auth/User',
    DEACTIVATE_ACCOUNT: '/gateway/auth/User/Deactivate',
    REACTIVATE_ACCOUNT: '/gateway/auth/User/Reactivate',
    
    // Address Management (Customer only)
    GET_ADDRESSES: '/gateway/auth/User/Addresses',
    GET_ADDRESS_BY_ID: (id: string) => `/gateway/auth/User/Address/${id}`,
    ADD_ADDRESS: '/gateway/auth/User/Address',
    UPDATE_ADDRESS: '/gateway/auth/User/Address',
    DELETE_ADDRESS: (id: string) => `/gateway/auth/User/Address/${id}`,
    
    // Admin Only
    GET_ALL_USERS: '/gateway/auth/User/AllUsers',
    GET_USER_BY_ID: (id: string) => `/gateway/auth/User/${id}`,
  },

  // ============================================
  // CATALOG SERVICE ENDPOINTS
  // ============================================
  CATALOG: {
    // Restaurants
    RESTAURANTS: '/gateway/catalog/Restaurant/restaurants',
    MY_RESTAURANTS: '/gateway/catalog/Restaurant/my-restaurants',
    RESTAURANT_BY_ID: (id: string) => `/gateway/catalog/Restaurant/restaurant/${id}`,
    RESTAURANT_SEARCH: (name: string) => `/gateway/catalog/Restaurant/restaurant/search/${name}`,
    RESTAURANT_BY_PINCODE: (pincode: string) => `/gateway/catalog/Restaurant/restaurant/near/${pincode}`,
    RESTAURANT_BY_CUISINE: (cuisineId: string) => `/gateway/catalog/Restaurant/restaurant/cuisine/${cuisineId}`,
    CREATE_RESTAURANT: '/gateway/catalog/Restaurant/restaurant',
    UPDATE_RESTAURANT: (id: string) => `/gateway/catalog/Restaurant/restaurant/${id}`,
    DELETE_RESTAURANT: (id: string) => `/gateway/catalog/Restaurant/restaurant/${id}`,
    
    // Categories
    CATEGORIES_BY_RESTAURANT: (restaurantId: string) => `/gateway/catalog/Category/restaurant/${restaurantId}`,
    CREATE_CATEGORY: '/gateway/catalog/Category',
    UPDATE_CATEGORY: (id: string) => `/gateway/catalog/Category/${id}`,
    TOGGLE_CATEGORY_STATUS: (id: string) => `/gateway/catalog/Category/${id}/toggle-status`,
    DELETE_CATEGORY: (id: string) => `/gateway/catalog/Category/${id}`,
    
    // Menu Items
    MENU_ITEM_BY_ID: (id: string) => `/gateway/catalog/MenuItem/${id}`,
    MENU_ITEMS_BY_RESTAURANT: (restaurantId: string) => `/gateway/catalog/MenuItem/restaurant/${restaurantId}`,
    MENU_ITEMS_BY_CATEGORY: (categoryId: string) => `/gateway/catalog/MenuItem/category/${categoryId}`,
    MENU_ITEMS_SEARCH: (name: string) => `/gateway/catalog/MenuItem/search?name=${name}`,
    CREATE_MENU_ITEM: '/gateway/catalog/MenuItem',
    UPDATE_MENU_ITEM: (id: string) => `/gateway/catalog/MenuItem/${id}`,
    DELETE_MENU_ITEM: (id: string) => `/gateway/catalog/MenuItem/${id}`,
  },

  // ============================================
  // ORDER SERVICE ENDPOINTS
  // ============================================
  ORDER: {
    // Orders (uses role-based filtering)
    ORDERS: '/gateway/order/orders', // GET returns orders based on user role (Customer or Partner)
    ORDER_BY_ID: (id: string) => `/gateway/order/orders/${id}`,
    CREATE_ORDER: '/gateway/order/orders',
    UPDATE_ORDER_STATUS: (id: string) => `/gateway/order/orders/${id}/status`,
    CANCEL_ORDER: (id: string) => `/gateway/order/orders/${id}/cancel`,
  },

  // ============================================
  // ADMIN SERVICE ENDPOINTS
  // ============================================
  ADMIN: {
    // Dashboard
    DASHBOARD: '/gateway/admin/Dashboard',
    
    // User Management
    USERS: '/gateway/admin/UserManagement',
    USER_BY_ID: (id: string) => `/gateway/admin/UserManagement/${id}`,
    UPDATE_USER: (id: string) => `/gateway/admin/UserManagement/${id}`,
    DELETE_USER: (id: string) => `/gateway/admin/UserManagement/${id}`,
    USERS_BY_ROLE: (role: string) => `/gateway/admin/UserManagement/role/${role}`,
    
    // Restaurant Management
    RESTAURANTS: '/gateway/admin/RestaurantManagement',
    RESTAURANT_BY_ID: (id: string) => `/gateway/admin/RestaurantManagement/${id}`,
    RESTAURANTS_BY_OWNER: (ownerId: string) => `/gateway/admin/RestaurantManagement/owner/${ownerId}`,
    DELETE_RESTAURANT: (id: string) => `/gateway/admin/RestaurantManagement/${id}`,
    
    // Restaurant Approval
    PENDING_RESTAURANTS: '/gateway/admin/RestaurantApproval/pending',
    APPROVE_RESTAURANT_REQUEST: (id: string) => `/gateway/admin/RestaurantApproval/${id}/approve`,
    REJECT_RESTAURANT_REQUEST: (id: string) => `/gateway/admin/RestaurantApproval/${id}/reject`,
    
    // User Approval
    PENDING_USERS: '/gateway/admin/UserApproval/pending',
    APPROVE_USER_REQUEST: (email: string) => `/gateway/admin/UserApproval/${email}/approve`,
    REJECT_USER_REQUEST: (email: string) => `/gateway/admin/UserApproval/${email}/reject`,
    
    // Orders
    ALL_ORDERS: '/gateway/admin/Order',
    UPDATE_ORDER_STATUS: (id: string) => `/gateway/admin/Order/${id}/status`,
    
    // Reports
    SALES_REPORT: '/gateway/admin/Report/sales',
    USERS_REPORT: '/gateway/admin/Report/users',
    RESTAURANTS_REPORT: '/gateway/admin/Report/restaurants',
  },

} as const;
