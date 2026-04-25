# Food Delivery Frontend - Project Structure

## Complete Folder Structure

```
food-delivery-frontend/
│
├── src/
│   ├── app/
│   │   │
│   │   ├── core/                              ← Singleton services, guards, interceptors
│   │   │   │                                     (Imported ONCE in app.config.ts)
│   │   │   ├── interceptors/
│   │   │   │   ├── jwt.interceptor.ts         ← Adds Bearer token to every request
│   │   │   │   ├── error.interceptor.ts       ← Global error handling
│   │   │   │   └── loading.interceptor.ts     ← Show/hide loading spinner
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts              ← Blocks unauthenticated users
│   │   │   │   └── role.guard.ts              ← Blocks wrong-role users (Customer/Partner/Admin)
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts            ← Login, register, token storage, logout
│   │   │   │   ├── storage.service.ts         ← localStorage/sessionStorage wrapper
│   │   │   │   ├── api.service.ts             ← Base HTTP service for all API calls
│   │   │   │   ├── notification.service.ts    ← Toast/notification service
│   │   │   │   └── loading.service.ts         ← Loading state management
│   │   │   │
│   │   │   └── constants/
│   │   │       ├── api-endpoints.ts           ← All API endpoint URLs
│   │   │       ├── app-constants.ts           ← App-wide constants (roles, statuses)
│   │   │       └── storage-keys.ts            ← LocalStorage key names
│   │   │
│   │   ├── shared/                            ← Reusable components/pipes/directives
│   │   │   │                                     (Can be imported anywhere)
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   │   ├── navbar.component.ts
│   │   │   │   │   ├── navbar.component.html
│   │   │   │   │   └── navbar.component.css
│   │   │   │   │
│   │   │   │   ├── sidebar/
│   │   │   │   │   ├── sidebar.component.ts
│   │   │   │   │   ├── sidebar.component.html
│   │   │   │   │   └── sidebar.component.css
│   │   │   │   │
│   │   │   │   ├── toast/
│   │   │   │   │   ├── toast.component.ts
│   │   │   │   │   ├── toast.component.html
│   │   │   │   │   └── toast.component.css
│   │   │   │   │
│   │   │   │   ├── loading-spinner/
│   │   │   │   │   ├── loading-spinner.component.ts
│   │   │   │   │   ├── loading-spinner.component.html
│   │   │   │   │   └── loading-spinner.component.css
│   │   │   │   │
│   │   │   │   ├── modal/
│   │   │   │   │   ├── modal.component.ts
│   │   │   │   │   ├── modal.component.html
│   │   │   │   │   └── modal.component.css
│   │   │   │   │
│   │   │   │   ├── pagination/
│   │   │   │   │   ├── pagination.component.ts
│   │   │   │   │   ├── pagination.component.html
│   │   │   │   │   └── pagination.component.css
│   │   │   │   │
│   │   │   │   ├── card/
│   │   │   │   │   ├── card.component.ts
│   │   │   │   │   ├── card.component.html
│   │   │   │   │   └── card.component.css
│   │   │   │   │
│   │   │   │   └── button/
│   │   │   │       ├── button.component.ts
│   │   │   │       ├── button.component.html
│   │   │   │       └── button.component.css
│   │   │   │
│   │   │   ├── models/                        ← TypeScript interfaces matching backend DTOs
│   │   │   │   ├── user.model.ts              ← User, Profile, Address interfaces
│   │   │   │   ├── auth.model.ts              ← Login, Register, Token interfaces
│   │   │   │   ├── restaurant.model.ts        ← Restaurant, Menu, Category interfaces
│   │   │   │   ├── order.model.ts             ← Order, OrderItem, OrderStatus interfaces
│   │   │   │   ├── cart.model.ts              ← Cart, CartItem interfaces
│   │   │   │   ├── payment.model.ts           ← Payment interfaces
│   │   │   │   └── api-response.model.ts      ← Generic API response wrapper
│   │   │   │
│   │   │   ├── pipes/
│   │   │   │   ├── currency-format.pipe.ts    ← Custom currency formatting
│   │   │   │   ├── date-format.pipe.ts        ← Custom date formatting
│   │   │   │   ├── time-ago.pipe.ts           ← "2 hours ago" format
│   │   │   │   └── truncate.pipe.ts           ← Truncate long text
│   │   │   │
│   │   │   ├── directives/
│   │   │   │   ├── click-outside.directive.ts ← Detect clicks outside element
│   │   │   │   ├── lazy-load.directive.ts     ← Lazy load images
│   │   │   │   └── debounce.directive.ts      ← Debounce input events
│   │   │   │
│   │   │   └── validators/
│   │   │       ├── password-match.validator.ts ← Confirm password validation
│   │   │       ├── phone.validator.ts          ← Phone number validation
│   │   │       └── custom-email.validator.ts   ← Custom email validation
│   │   │
│   │   ├── features/                          ← Feature modules (one per role/domain)
│   │   │   │
│   │   │   ├── auth/                          ← Authentication feature
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.css
│   │   │   │   │
│   │   │   │   ├── register/
│   │   │   │   │   ├── register.component.ts
│   │   │   │   │   ├── register.component.html
│   │   │   │   │   └── register.component.css
│   │   │   │   │
│   │   │   │   ├── forgot-password/
│   │   │   │   │   ├── forgot-password.component.ts
│   │   │   │   │   ├── forgot-password.component.html
│   │   │   │   │   └── forgot-password.component.css
│   │   │   │   │
│   │   │   │   ├── reset-password/
│   │   │   │   │   ├── reset-password.component.ts
│   │   │   │   │   ├── reset-password.component.html
│   │   │   │   │   └── reset-password.component.css
│   │   │   │   │
│   │   │   │   ├── two-factor/
│   │   │   │   │   ├── two-factor.component.ts
│   │   │   │   │   ├── two-factor.component.html
│   │   │   │   │   └── two-factor.component.css
│   │   │   │   │
│   │   │   │   └── services/
│   │   │   │       └── auth-api.service.ts    ← Auth-specific API calls
│   │   │   │
│   │   │   ├── customer/                      ← Customer role features
│   │   │   │   │
│   │   │   │   ├── home/
│   │   │   │   │   ├── home.component.ts
│   │   │   │   │   ├── home.component.html
│   │   │   │   │   └── home.component.css
│   │   │   │   │
│   │   │   │   ├── restaurant-list/
│   │   │   │   │   ├── restaurant-list.component.ts
│   │   │   │   │   ├── restaurant-list.component.html
│   │   │   │   │   ├── restaurant-list.component.css
│   │   │   │   │   └── components/
│   │   │   │   │       └── restaurant-card/   ← Child component
│   │   │   │   │
│   │   │   │   ├── restaurant-detail/
│   │   │   │   │   ├── restaurant-detail.component.ts
│   │   │   │   │   ├── restaurant-detail.component.html
│   │   │   │   │   ├── restaurant-detail.component.css
│   │   │   │   │   └── components/
│   │   │   │   │       ├── menu-item-card/
│   │   │   │   │       └── reviews-section/
│   │   │   │   │
│   │   │   │   ├── cart/
│   │   │   │   │   ├── cart.component.ts
│   │   │   │   │   ├── cart.component.html
│   │   │   │   │   └── cart.component.css
│   │   │   │   │
│   │   │   │   ├── checkout/
│   │   │   │   │   ├── checkout.component.ts
│   │   │   │   │   ├── checkout.component.html
│   │   │   │   │   ├── checkout.component.css
│   │   │   │   │   └── components/
│   │   │   │   │       ├── address-form/
│   │   │   │   │       └── payment-method/
│   │   │   │   │
│   │   │   │   ├── order-tracking/
│   │   │   │   │   ├── order-tracking.component.ts
│   │   │   │   │   ├── order-tracking.component.html
│   │   │   │   │   └── order-tracking.component.css
│   │   │   │   │
│   │   │   │   ├── order-history/
│   │   │   │   │   ├── order-history.component.ts
│   │   │   │   │   ├── order-history.component.html
│   │   │   │   │   └── order-history.component.css
│   │   │   │   │
│   │   │   │   ├── profile/
│   │   │   │   │   ├── profile.component.ts
│   │   │   │   │   ├── profile.component.html
│   │   │   │   │   ├── profile.component.css
│   │   │   │   │   └── components/
│   │   │   │   │       ├── edit-profile/
│   │   │   │   │       ├── manage-addresses/
│   │   │   │   │       ├── change-password/
│   │   │   │   │       └── security-settings/
│   │   │   │   │
│   │   │   │   └── services/
│   │   │   │       ├── restaurant.service.ts  ← Restaurant API calls
│   │   │   │       ├── order.service.ts       ← Order API calls
│   │   │   │       ├── cart.service.ts        ← Cart state management
│   │   │   │       └── profile.service.ts     ← Profile API calls
│   │   │   │
│   │   │   ├── partner/                       ← Partner (Restaurant Owner) features
│   │   │   │   │
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── dashboard.component.ts
│   │   │   │   │   ├── dashboard.component.html
│   │   │   │   │   ├── dashboard.component.css
│   │   │   │   │   └── components/
│   │   │   │   │       ├── stats-card/
│   │   │   │   │       ├── revenue-chart/
│   │   │   │   │       └── recent-orders/
│   │   │   │   │
│   │   │   │   ├── restaurant-management/
│   │   │   │   │   ├── restaurant-management.component.ts
│   │   │   │   │   ├── restaurant-management.component.html
│   │   │   │   │   ├── restaurant-management.component.css
│   │   │   │   │   └── components/
│   │   │   │   │       ├── restaurant-info-form/
│   │   │   │   │       ├── operating-hours/
│   │   │   │   │       └── delivery-areas/
│   │   │   │   │
│   │   │   │   ├── menu-management/
│   │   │   │   │   ├── menu-management.component.ts
│   │   │   │   │   ├── menu-management.component.html
│   │   │   │   │   ├── menu-management.component.css
│   │   │   │   │   └── components/
│   │   │   │   │       ├── menu-item-form/
│   │   │   │   │       ├── category-management/
│   │   │   │   │       └── menu-item-list/
│   │   │   │   │
│   │   │   │   ├── order-management/
│   │   │   │   │   ├── order-management.component.ts
│   │   │   │   │   ├── order-management.component.html
│   │   │   │   │   ├── order-management.component.css
│   │   │   │   │   └── components/
│   │   │   │   │       ├── order-card/
│   │   │   │   │       └── order-details/
│   │   │   │   │
│   │   │   │   └── services/
│   │   │   │       ├── partner-restaurant.service.ts
│   │   │   │       ├── partner-menu.service.ts
│   │   │   │       └── partner-order.service.ts
│   │   │   │
│   │   │   └── admin/                         ← Admin role features
│   │   │       │
│   │   │       ├── dashboard/
│   │   │       │   ├── dashboard.component.ts
│   │   │       │   ├── dashboard.component.html
│   │   │       │   ├── dashboard.component.css
│   │   │       │   └── components/
│   │   │       │       ├── stats-overview/
│   │   │       │       ├── revenue-chart/
│   │   │       │       └── recent-activity/
│   │   │       │
│   │   │       ├── users/
│   │   │       │   ├── user-list/
│   │   │       │   │   ├── user-list.component.ts
│   │   │       │   │   ├── user-list.component.html
│   │   │       │   │   └── user-list.component.css
│   │   │       │   │
│   │   │       │   ├── user-detail/
│   │   │       │   │   ├── user-detail.component.ts
│   │   │       │   │   ├── user-detail.component.html
│   │   │       │   │   └── user-detail.component.css
│   │   │       │   │
│   │   │       │   └── pending-approvals/
│   │   │       │       ├── pending-approvals.component.ts
│   │   │       │       ├── pending-approvals.component.html
│   │   │       │       └── pending-approvals.component.css
│   │   │       │
│   │   │       ├── restaurants/
│   │   │       │   ├── restaurant-list/
│   │   │       │   │   ├── restaurant-list.component.ts
│   │   │       │   │   ├── restaurant-list.component.html
│   │   │       │   │   └── restaurant-list.component.css
│   │   │       │   │
│   │   │       │   └── restaurant-detail/
│   │   │       │       ├── restaurant-detail.component.ts
│   │   │       │       ├── restaurant-detail.component.html
│   │   │       │       └── restaurant-detail.component.css
│   │   │       │
│   │   │       ├── orders/
│   │   │       │   ├── order-list/
│   │   │       │   │   ├── order-list.component.ts
│   │   │       │   │   ├── order-list.component.html
│   │   │       │   │   └── order-list.component.css
│   │   │       │   │
│   │   │       │   └── order-detail/
│   │   │       │       ├── order-detail.component.ts
│   │   │       │       ├── order-detail.component.html
│   │   │       │       └── order-detail.component.css
│   │   │       │
│   │   │       ├── reports/
│   │   │       │   ├── reports.component.ts
│   │   │       │   ├── reports.component.html
│   │   │       │   ├── reports.component.css
│   │   │       │   └── components/
│   │   │       │       ├── revenue-report/
│   │   │       │       ├── user-growth-report/
│   │   │       │       └── order-statistics/
│   │   │       │
│   │   │       └── services/
│   │   │           ├── admin-user.service.ts
│   │   │           ├── admin-restaurant.service.ts
│   │   │           ├── admin-order.service.ts
│   │   │           └── admin-report.service.ts
│   │   │
│   │   ├── layouts/                           ← Layout components
│   │   │   ├── main-layout/
│   │   │   │   ├── main-layout.component.ts   ← Layout with navbar + sidebar
│   │   │   │   ├── main-layout.component.html
│   │   │   │   └── main-layout.component.css
│   │   │   │
│   │   │   ├── auth-layout/
│   │   │   │   ├── auth-layout.component.ts   ← Minimal layout for login/register
│   │   │   │   ├── auth-layout.component.html
│   │   │   │   └── auth-layout.component.css
│   │   │   │
│   │   │   └── admin-layout/
│   │   │       ├── admin-layout.component.ts  ← Admin-specific layout
│   │   │       ├── admin-layout.component.html
│   │   │       └── admin-layout.component.css
│   │   │
│   │   ├── app.component.ts                   ← Root component (shell)
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   ├── app.routes.ts                      ← All route definitions
│   │   └── app.config.ts                      ← App-level providers (HttpClient, etc.)
│   │
│   ├── assets/                                ← Static assets
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   ├── placeholder.png
│   │   │   └── icons/
│   │   │
│   │   ├── fonts/
│   │   │
│   │   └── styles/
│   │       ├── variables.css                  ← CSS custom properties (colors, spacing)
│   │       └── themes/
│   │
│   ├── environments/
│   │   ├── environment.ts                     ← Development config
│   │   │                                         { apiUrl: 'http://localhost:5000' }
│   │   └── environment.prod.ts                ← Production config
│   │                                             { apiUrl: 'https://api.fooddelivery.com' }
│   │
│   ├── styles.css                             ← Global styles
│   ├── index.html                             ← Single HTML file (the "S" in SPA)
│   └── main.ts                                ← Bootstrap entry point
│
├── .editorconfig                              ← Editor configuration
├── .gitignore                                 ← Git ignore rules
├── .prettierrc                                ← Code formatting rules
├── angular.json                               ← Angular CLI config
├── package.json                               ← Dependencies
├── package-lock.json
├── tsconfig.json                              ← TypeScript config
├── tsconfig.app.json
└── tsconfig.spec.json
```

---

## Folder Descriptions

### 📁 **core/**
**Purpose**: Singleton services, guards, and interceptors used throughout the app.  
**Import Rule**: Import ONCE in `app.config.ts` providers.  
**Contains**:
- **interceptors/**: HTTP interceptors (JWT, error handling, loading)
- **guards/**: Route guards (auth, role-based access)
- **services/**: Core services (auth, storage, API, notifications)
- **constants/**: App-wide constants (API endpoints, storage keys)

---

### 📁 **shared/**
**Purpose**: Reusable components, pipes, directives, and models used across features.  
**Import Rule**: Can be imported anywhere in the app.  
**Contains**:
- **components/**: Reusable UI components (navbar, toast, spinner, modal, etc.)
- **models/**: TypeScript interfaces matching backend DTOs
- **pipes/**: Custom pipes (date format, currency, truncate)
- **directives/**: Custom directives (click-outside, lazy-load)
- **validators/**: Custom form validators

---

### 📁 **features/**
**Purpose**: Feature modules organized by role or business domain.  
**Import Rule**: Each feature is self-contained with its own components and services.  
**Contains**:
- **auth/**: Authentication (login, register, forgot password, 2FA)
- **customer/**: Customer-facing features (browse, order, track)
- **partner/**: Restaurant owner features (menu, orders, dashboard)
- **admin/**: Admin features (user management, reports, approvals)

---

### 📁 **layouts/**
**Purpose**: Layout wrapper components for different sections of the app.  
**Contains**:
- **main-layout/**: Standard layout with navbar + sidebar
- **auth-layout/**: Minimal layout for login/register pages
- **admin-layout/**: Admin-specific layout with admin sidebar

---

### 📁 **assets/**
**Purpose**: Static files (images, fonts, styles).  
**Contains**:
- **images/**: Logos, icons, placeholders
- **fonts/**: Custom fonts
- **styles/**: CSS variables and themes

---

### 📁 **environments/**
**Purpose**: Environment-specific configuration.  
**Contains**:
- **environment.ts**: Development config (local API URL)
- **environment.prod.ts**: Production config (production API URL)

---

## File Naming Conventions

### Components
```
feature-name.component.ts
feature-name.component.html
feature-name.component.css
feature-name.component.spec.ts
```

### Services
```
feature-name.service.ts
feature-name.service.spec.ts
```

### Models
```
entity-name.model.ts
```

### Guards
```
feature-name.guard.ts
```

### Interceptors
```
feature-name.interceptor.ts
```

### Pipes
```
pipe-name.pipe.ts
```

### Directives
```
directive-name.directive.ts
```

---

## Module Organization Strategy

### Core Module (Singleton)
- Imported ONCE in `app.config.ts`
- Contains services that should have only one instance
- Examples: AuthService, StorageService, NotificationService

### Shared Module (Reusable)
- Imported in any feature module that needs it
- Contains reusable components, pipes, directives
- Examples: Navbar, Toast, LoadingSpinner

### Feature Modules (Lazy Loaded)
- Each feature is a separate module
- Lazy loaded for better performance
- Examples: CustomerModule, PartnerModule, AdminModule

---

## Routing Structure

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/customer/home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'customer',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'Customer' },
    loadChildren: () => import('./features/customer/customer.routes').then(m => m.CUSTOMER_ROUTES)
  },
  {
    path: 'partner',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'Partner' },
    loadChildren: () => import('./features/partner/partner.routes').then(m => m.PARTNER_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'Admin' },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/customer/home'
  }
];
```

---

## Service Organization

### Core Services (Singleton)
- **AuthService**: Login, register, token management, logout
- **StorageService**: LocalStorage/SessionStorage wrapper
- **ApiService**: Base HTTP service for all API calls
- **NotificationService**: Toast/notification management
- **LoadingService**: Loading state management

### Feature Services
- **RestaurantService**: Restaurant-related API calls
- **OrderService**: Order-related API calls
- **CartService**: Cart state management
- **ProfileService**: User profile API calls
- **AdminUserService**: Admin user management API calls
- **PartnerMenuService**: Partner menu management API calls

---

## State Management

### Local Component State
- Use for simple, component-specific state
- Example: Form values, UI toggles

### Service-Based State
- Use for shared state across components
- Example: CartService, AuthService
- Use BehaviorSubject for reactive state

### NgRx (Optional - for complex apps)
- Use for complex, app-wide state
- Example: Large e-commerce apps with complex state

---

## Best Practices

### 1. Component Organization
- Keep components small and focused (< 300 lines)
- Extract child components when needed
- Use smart/dumb component pattern

### 2. Service Organization
- One service per domain/feature
- Use dependency injection
- Keep services stateless when possible

### 3. Model Organization
- Create interfaces for all DTOs
- Use TypeScript strict mode
- Export models from index.ts for easy imports

### 4. Routing
- Use lazy loading for feature modules
- Implement route guards for protected routes
- Use route resolvers for data fetching

### 5. Error Handling
- Use global error interceptor
- Show user-friendly error messages
- Log errors for debugging

### 6. Performance
- Use OnPush change detection strategy
- Implement virtual scrolling for long lists
- Lazy load images
- Use trackBy in *ngFor

### 7. Testing
- Write unit tests for services
- Write component tests for critical components
- Use E2E tests for critical user flows

---

## Import Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@layouts/*": ["src/app/layouts/*"],
      "@environments/*": ["src/environments/*"]
    }
  }
}
```

**Usage**:
```typescript
import { AuthService } from '@core/services/auth.service';
import { User } from '@shared/models/user.model';
import { LoginComponent } from '@features/auth/login/login.component';
```

---

## Quick Reference

### Where to put new code?

| What you're adding | Where it goes |
|-------------------|---------------|
| New page/route | `features/{role}/{feature-name}/` |
| Reusable component | `shared/components/` |
| Service used everywhere | `core/services/` |
| Service for one feature | `features/{feature}/services/` |
| Interface/Model | `shared/models/` |
| Custom pipe | `shared/pipes/` |
| Custom directive | `shared/directives/` |
| Route guard | `core/guards/` |
| HTTP interceptor | `core/interceptors/` |
| Constants | `core/constants/` |
| Validator | `shared/validators/` |

---

## Next Steps

1. ✅ Review this structure
2. ✅ Scaffold the folder structure
3. ✅ Setup core services (Auth, API, Storage)
4. ✅ Create shared components (Navbar, Toast, Spinner)
5. ✅ Implement authentication flow
6. ✅ Build customer features
7. ✅ Build partner features
8. ✅ Build admin features
9. ✅ Polish and optimize

---

**Last Updated**: April 23, 2026
