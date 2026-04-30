/**
 * Order Models — Updated for Multi-Vendor Backend
 * Matches OrderService backend DTOs exactly.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum OrderStatus {
  Placed = 'Placed',
  Paid = 'Paid',
  InProgress = 'InProgress',
  OutForDelivery = 'OutForDelivery',
  Delivered = 'Delivered',
  CancelledByCustomer = 'CancelledByCustomer',
  CancelledBySystem = 'CancelledBySystem'
}

export enum RestaurantOrderStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Preparing = 'Preparing',
  ReadyForPickup = 'ReadyForPickup',
  PickedUp = 'PickedUp',
  Cancelled = 'Cancelled'
}

export enum PaymentMethod {
  COD = 'COD',
  Online = 'Online'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded'
}

export enum DeliveryStatus {
  Assigned = 'Assigned',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered'
}

// ─── Customer DTOs ────────────────────────────────────────────────────────────

export interface OrderItemResponseDTO {
  id: string;
  menuItemId: string;
  menuItemName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface RestaurantOrderSummaryDTO {
  id: string;
  restaurantId: string;
  restaurantName: string;
  status: string;
  subTotal: number;
  cancellationReason?: string;
  items: OrderItemResponseDTO[];
}

export interface OrderPaymentDTO {
  id: string;
  method: string;
  status: string;
  amount: number;
  transactionReference?: string;
}

/** Full order response (customer view) — all restaurants grouped */
export interface OrderResponseDTO {
  id: string;
  customerId: string;
  customerName: string;
  status: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  deliveryInstructions?: string;
  scheduledSlot?: string;
  totalAmount: number;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  payment?: OrderPaymentDTO;
  restaurantOrders: RestaurantOrderSummaryDTO[];
}

/** Input for checkout — uses local storage items */
export interface CheckoutDTO {
  addressId: string;
  paymentMethod: PaymentMethod;
  deliveryInstructions?: string;
  scheduledSlot?: string;
  items: CartItemDTO[];
}

export interface CartItemDTO {
  menuItemId: string;
  menuItemName: string;
  unitPrice: number;
  quantity: number;
  restaurantId: string;
}

export interface CancelOrderDTO {
  cancellationReason: string;
}

// ─── Partner DTOs ─────────────────────────────────────────────────────────────

/** Partner view of a sub-order — only their restaurant's items */
export interface PartnerOrderResponseDTO {
  subOrderId: string;
  parentOrderId: string;
  status: string;
  subTotal: number;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  deliveryStreet: string;
  deliveryCity: string;
  deliveryPincode: string;
  deliveryInstructions?: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItemResponseDTO[];
}

export interface UpdateRestaurantOrderStatusDTO {
  status: RestaurantOrderStatus;
  cancellationReason?: string;
}

// ─── Delivery Agent DTOs ──────────────────────────────────────────────────────

export interface DeliveryItemDTO {
  menuItemName: string;
  quantity: number;
}

export interface DeliveryRestaurantStopDTO {
  subOrderId: string;
  restaurantName: string;
  restaurantAddress: string;
  subOrderStatus: string;
  subTotal: number;
  items: DeliveryItemDTO[];
}

/** Delivery agent view of an assigned order — all restaurant stops + drop-off */
export interface DeliveryOrderResponseDTO {
  orderId: string;
  customerName: string;
  overallStatus: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  dropoffStreet: string;
  dropoffCity: string;
  dropoffState: string;
  dropoffPincode: string;
  deliveryInstructions?: string;
  assignmentId: string;
  assignmentStatus: string;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  createdAt: string | Date;
  restaurantStops: DeliveryRestaurantStopDTO[];
}

export interface UpdatePaymentStatusDTO {
  status: PaymentStatus;
}

export interface UpdateDeliveryStatusDTO {
  status: DeliveryStatus;
}

export interface UpsertAgentProfileDTO {
  currentPincode: string;
  isActive: boolean;
}

export interface AgentProfileResponseDTO {
  id: string;
  agentUserId: string;
  isActive: boolean;
  currentPincode: string;
  lastUpdated: string;
}
