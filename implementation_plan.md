# Cart, Checkout, Order & Payment Redesign - Implementation Plan

## Open Questions (User Review Required)

> [!IMPORTANT]
> **1. Payment Gateway**: Do you want to integrate a real payment gateway (e.g. Razorpay, Stripe) or keep a simulation? If simulation, I'll design a clean mock that properly simulates pending → success/failure without two separate API calls.
>
> **2. Delivery Agent Assignment**: Should the system auto-assign a delivery agent from the `UserSummaries` table (randomly picking an available DeliveryAgent), or should it remain manual (admin/partner assigns)?
>
> **3. Cart Conflict on Restaurant Switch**: When a user adds an item from a different restaurant, should we:
> - **A)** Auto-clear the cart and add the new item (with a 200 response that includes a `cartCleared: true` flag)
> - **B)** Return a 409 Conflict and let the frontend ask the user

---

## Current System Issues

### Cart
- **UX**: Requires manually creating a cart first, then adding items separately.
- **Dependency**: Cart is tied to a restaurant at creation time.
- **Logic**: Multiple active carts per user allowed.
- **States**: `CartStatus.Abandoned` is set when the last item is deleted (unintuitive).
- **Checkout**: Checkout service is redundant and lacks validation.

### Orders & Payment
- **Coupling**: Payment is created inside `PlaceOrderAsync` (mixing concerns).
- **Simulation**: `PaymentService` simulation is scattered and confusing.
- **Dead Code**: Separate `PaymentService` microservice is empty.
- **Process**: No concept of `PaymentMethod` at checkout.
- **Transitions**: Granular and confusing status transitions (e.g., `PickedUp` vs `OutForDelivery`).

---

## Proposed New Flow

`Add to Cart (upsert) → View Checkout Summary → Place Order → Process Payment → Fulfillment`

### Key Principles
1. **One active cart per user** — Always.
2. **Item-first** — Restaurant is derived from items.
3. **Implicit Cart** — Created on first item add.
4. **Decoupled Payment** — Separate step after order placement.
5. **Simplified Statuses** — Clean transition from Pending to Delivered.

---

## Proposed Changes

### 1. Domain Layer (`OrderService.Domain`)
- **Cart**: Remove `RestaurantId` (derive from items), simplify status.
- **Order**: Add `RestaurantName`, `PaymentMethod`, `PaymentStatus` (snapshots).
- **Payment**: Add `FailureReason`, `PaidAt`, `GatewayResponse`.

### 2. Application Layer (`OrderService.Application`)
- **CartService**: Support `UpsertCartItemAsync`, `GetCartSummaryAsync`.
- **OrderManagementService**: Refactor `PlaceOrderAsync` to decouple payment.
- **PaymentService**: New single-step process (Initiate/Process).
- **DeliveryService**: Add `AutoAssignDeliveryAgent` logic.

### 3. API Layer (`OrderService.API`)
- **CartController**: GET/POST/DELETE on `/api/cart`.
- **OrderController**: Clean RESTful endpoints for history and placement.
- **PaymentController**: Explicit endpoints for processing payments.

### 4. Infrastructure
- New events: `OrderConfirmedEvent`, `PaymentProcessedEvent`.

---

## Verification Plan
1. **Automated**: Unit tests for Cart upsert logic and Payment flows.
2. **Manual**: E2E testing of the new "Add to Cart" -> "Payment" -> "Delivery" flow.
