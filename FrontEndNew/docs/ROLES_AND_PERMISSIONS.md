# Roles and Permissions

## Overview
The QuickBites application supports 4 user roles with different permissions and approval workflows.

## Available Roles

### 1. Customer (RoleEnum = 0)
**Description:** End users who order food from restaurants.

**Registration:**
- ✅ Instant activation (no approval required)
- ✅ Can login immediately after registration
- ✅ Email confirmation required for full access

**Permissions:**
- Browse restaurants and menus
- Place orders
- Track order status
- Manage delivery addresses
- View order history
- Rate and review restaurants
- Manage profile settings

**Backend Behavior:**
- `IsActive = true` by default
- User data synced immediately to other services
- No admin approval needed

---

### 2. Partner (RoleEnum = 1)
**Description:** Restaurant owners who manage their restaurant listings and orders.

**Registration:**
- ⏳ Requires admin approval
- ❌ Cannot login until approved
- 📧 Receives notification when approved

**Permissions (after approval):**
- Create and manage restaurant profiles
- Manage menu items and pricing
- View and process incoming orders
- Update order status
- View sales analytics
- Manage restaurant settings
- Respond to customer reviews

**Backend Behavior:**
- `IsActive = false` by default
- Requires admin approval via `RoleApprovalRequest`
- User data synced only after approval
- Admin must approve via `/api/admin/approve-request`

---

### 3. DeliveryAgent (RoleEnum = 2)
**Description:** Delivery personnel who pick up and deliver orders.

**Registration:**
- ✅ Instant activation (no approval required)
- ✅ Can login immediately after registration
- ✅ Email confirmation required

**Permissions:**
- View assigned delivery orders
- Update delivery status
- Navigate to pickup/delivery locations
- Mark orders as delivered
- View delivery history
- Manage availability status
- Track earnings

**Backend Behavior:**
- `IsActive = true` by default
- User data synced immediately to other services
- No admin approval needed

---

### 4. Admin (RoleEnum = 3)
**Description:** System administrators with full access to manage the platform.

**Registration:**
- ⏳ Requires admin approval
- ❌ Cannot login until approved
- 🔒 Highest security level

**Permissions:**
- Approve/reject Partner and Admin registrations
- Manage all users (activate/deactivate accounts)
- View system-wide analytics
- Manage platform settings
- Access all restaurants and orders
- Handle disputes and refunds
- Monitor system health
- Manage delivery agents

**Backend Behavior:**
- `IsActive = false` by default
- Requires existing admin approval
- User data synced only after approval
- Highest privilege level

---

## Role Approval Workflow

### Roles Requiring Approval
- **Partner** (Restaurant Owners)
- **Admin** (System Administrators)

### Approval Process

1. **User Registration:**
   ```typescript
   POST /api/auth/register
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "SecurePass123",
     "phoneNumber": "1234567890",
     "role": 1  // Partner
   }
   ```

2. **Backend Creates Approval Request:**
   - User account created with `IsActive = false`
   - `RoleApprovalRequest` entry created
   - User receives message: "Please wait for admin approval"

3. **Admin Reviews Request:**
   - Admin views pending requests: `GET /api/admin/pending-requests`
   - Admin approves: `POST /api/admin/approve-request?email=john@example.com`

4. **User Activated:**
   - `IsActive` set to `true`
   - User data synced to other services
   - User can now login

### Roles with Instant Activation
- **Customer**
- **DeliveryAgent**

These roles are activated immediately upon registration and can login right away.

---

## Frontend Implementation

### Role Selection UI
The registration form displays all 4 roles in a 2x2 grid:

```
┌─────────────┬─────────────┐
│  Customer   │   Partner   │
├─────────────┼─────────────┤
│ Delivery    │    Admin    │
│   Agent     │             │
└─────────────┴─────────────┘
```

### Role Enum Mapping
```typescript
export enum RoleEnum {
  Customer = 0,
  Partner = 1,
  DeliveryAgent = 2,
  Admin = 3
}
```

### Registration Component
- **File:** `FrontEnd/src/app/features/auth/register/register.component.ts`
- **Role Selection:** Grid layout with 4 buttons
- **Validation:** All roles validated before submission
- **Feedback:** Different messages based on role approval requirements

---

## Route Protection

### Using Role Guard
```typescript
import { RoleEnum } from './shared/models/auth.model';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleEnum.Admin] }
  },
  {
    path: 'restaurant',
    component: RestaurantDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleEnum.Partner] }
  },
  {
    path: 'delivery',
    component: DeliveryDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleEnum.DeliveryAgent] }
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleEnum.Customer, RoleEnum.Partner] }
  }
];
```

---

## Backend Role Logic

### Registration Logic (AuthService)
```csharp
// Customer and DeliveryAgent: Instant activation
if (model.Role == RoleEnum.Customer || model.Role == RoleEnum.DeliveryAgent)
{
    newUser.IsActive = true;
    // Publish sync event immediately
    await _userDataSyncPublisher.PublishUserDataSync(...);
}

// Partner and Admin: Requires approval
if (model.Role != RoleEnum.Customer && model.Role != RoleEnum.DeliveryAgent)
{
    newUser.IsActive = false;
    // Create approval request
    await _authRepository.AddRoleApprovalRequest(new RoleApprovalRequest
    {
        Email = model.Email,
        Role = model.Role,
        RequestedAt = DateTime.UtcNow
    });
}
```

---

## Testing Roles

### Test Accounts
Create test accounts for each role:

```bash
# Customer (instant activation)
POST /api/auth/register
{ "role": 0, "email": "customer@test.com", ... }

# Partner (needs approval)
POST /api/auth/register
{ "role": 1, "email": "partner@test.com", ... }

# DeliveryAgent (instant activation)
POST /api/auth/register
{ "role": 2, "email": "delivery@test.com", ... }

# Admin (needs approval)
POST /api/auth/register
{ "role": 3, "email": "admin@test.com", ... }
```

### Approval Testing
1. Register as Partner or Admin
2. Login as existing Admin
3. View pending requests: `GET /api/admin/pending-requests`
4. Approve request: `POST /api/admin/approve-request?email=partner@test.com`
5. Login with newly approved account

---

## Security Considerations

1. **Role Validation:** Backend validates role on every request
2. **JWT Claims:** Role stored in JWT token
3. **Route Protection:** Frontend guards prevent unauthorized access
4. **API Authorization:** Backend controllers check role permissions
5. **Approval Workflow:** Prevents unauthorized admin/partner access

---

## Future Enhancements

- [ ] Role-based UI customization
- [ ] Permission granularity (sub-permissions per role)
- [ ] Role change requests
- [ ] Multi-role support (user with multiple roles)
- [ ] Role-based notifications
- [ ] Audit logging for role changes
