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
    REGISTER: '/api/Auth/Register',
    LOGIN: '/api/Auth/Login',
    LOGOUT: '/api/Auth/Logout',
    REFRESH: '/api/Auth/Refresh',
    ME: '/api/Auth/Me',
    
    // Password Management
    FORGOT_PASSWORD: '/api/Auth/ForgotPassword',
    RESET_PASSWORD: '/api/Auth/ResetPassword',
    CHANGE_PASSWORD: '/api/Auth/ChangePassword',
    
    // Email Confirmation
    SEND_EMAIL_CONFIRMATION_OTP: '/api/Auth/SendEmailConfirmationOTP',
    CONFIRM_EMAIL: '/api/Auth/ConfirmEmail',
    
    // Two-Factor Authentication
    SET_TWO_FACTOR_AUTH: '/api/Auth/SetTwoFactorAuth',
    TWO_FACTOR_AUTH: '/api/Auth/TwoFactorAuth',
    VERIFY_OTP: '/api/Auth/VerifyOTP',
    
    // Admin Only
    PROMOTE_ROLE: '/api/Auth/PromoteRole',
    CHANGE_ACCOUNT_STATUS: '/api/Auth/ChangeAccountStatus',
    PENDING_REQUESTS: '/api/Auth/PendingRequests',
    APPROVE_REQUEST: (email: string) => `/api/Auth/ApproveRequest/${email}`,
  },

  // ============================================
  // CATALOG SERVICE ENDPOINTS
  // ============================================
  CATALOG: {
    // Restaurants
    RESTAURANTS: '/api/Restaurant',
    RESTAURANT_BY_ID: (id: number) => `/api/Restaurant/${id}`,
    RESTAURANT_SEARCH: '/api/Restaurant/search',
    
    // Categories
    CATEGORIES: '/api/Category',
    CATEGORY_BY_ID: (id: number) => `/api/Category/${id}`,
    
    // Menu Items
    MENU_ITEMS: '/api/MenuItem',
    MENU_ITEM_BY_ID: (id: number) => `/api/MenuItem/${id}`,
    MENU_ITEMS_BY_RESTAURANT: (restaurantId: number) => `/api/MenuItem/restaurant/${restaurantId}`,
    MENU_ITEMS_BY_CATEGORY: (categoryId: number) => `/api/MenuItem/category/${categoryId}`,
  },

  // ============================================
  // ORDER SERVICE ENDPOINTS
  // ============================================
  ORDER: {
    // Orders
    ORDERS: '/api/Order',
    ORDER_BY_ID: (id: number) => `/api/Order/${id}`,
    CREATE_ORDER: '/api/Order',
    UPDATE_ORDER_STATUS: (id: number) => `/api/Order/${id}/status`,
    CANCEL_ORDER: (id: number) => `/api/Order/${id}/cancel`,
    
    // Customer Orders
    MY_ORDERS: '/api/Order/my-orders',
    ORDER_HISTORY: '/api/Order/history',
    
    // Partner Orders
    RESTAURANT_ORDERS: (restaurantId: number) => `/api/Order/restaurant/${restaurantId}`,
    
    // Payments
    PAYMENTS: '/api/Payment',
    PAYMENT_BY_ID: (id: number) => `/api/Payment/${id}`,
    PROCESS_PAYMENT: '/api/Payment/process',
  },

  // ============================================
  // ADMIN SERVICE ENDPOINTS
  // ============================================
  ADMIN: {
    // Dashboard
    DASHBOARD: '/api/Dashboard',
    DASHBOARD_STATS: '/api/Dashboard/stats',
    
    // User Management
    USERS: '/api/UserManagement',
    USER_BY_ID: (id: string) => `/api/UserManagement/${id}`,
    UPDATE_USER_STATUS: '/api/UserManagement/status',
    
    // Restaurant Management
    RESTAURANTS: '/api/RestaurantManagement',
    RESTAURANT_BY_ID: (id: number) => `/api/RestaurantManagement/${id}`,
    APPROVE_RESTAURANT: (id: number) => `/api/RestaurantManagement/${id}/approve`,
    REJECT_RESTAURANT: (id: number) => `/api/RestaurantManagement/${id}/reject`,
    
    // Restaurant Approval
    PENDING_RESTAURANTS: '/api/RestaurantApproval/pending',
    APPROVE_RESTAURANT_REQUEST: (id: number) => `/api/RestaurantApproval/${id}/approve`,
    REJECT_RESTAURANT_REQUEST: (id: number) => `/api/RestaurantApproval/${id}/reject`,
    
    // User Approval
    PENDING_USERS: '/api/UserApproval/pending',
    APPROVE_USER_REQUEST: (id: string) => `/api/UserApproval/${id}/approve`,
    REJECT_USER_REQUEST: (id: string) => `/api/UserApproval/${id}/reject`,
    
    // Orders
    ALL_ORDERS: '/api/Order/all',
    ORDER_DETAILS: (id: number) => `/api/Order/${id}`,
    
    // Reports
    REPORTS: '/api/Report',
    REVENUE_REPORT: '/api/Report/revenue',
    USER_GROWTH_REPORT: '/api/Report/user-growth',
    ORDER_STATISTICS: '/api/Report/order-statistics',
  },

} as const;
