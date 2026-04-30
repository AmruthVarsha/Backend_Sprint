import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeliveryService } from '../../../core/services/delivery.service';
import {
  DeliveryOrderResponseDTO,
  DeliveryStatus,
  UpdateDeliveryStatusDTO,
  RestaurantOrderStatus
} from '../../../shared/models/order.model';

/** Delivery agent earns 8% of the order total per delivery. */
const DELIVERY_COMMISSION_RATE = 0.08;

@Component({
  selector: 'app-delivery-assigned-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delivery-assigned-tasks.html',
  styleUrl: './delivery-assigned-tasks.css',
})
export class DeliveryAssignedTasks implements OnInit, OnDestroy {

  assignments: DeliveryOrderResponseDTO[] = [];
  isLoading = true;
  errorMessage = '';
  updatingId: string | null = null;

  readonly DeliveryStatus = DeliveryStatus;
  readonly RestaurantOrderStatus = RestaurantOrderStatus;

  private destroy$ = new Subject<void>();

  constructor(
    private deliveryService: DeliveryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAssignments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.deliveryService.getAssignments().pipe(takeUntil(this.destroy$)).subscribe({
      next: (list) => {
        this.assignments = list;
        this.sortAssignments();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load assignments.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  canPickUp(assignment: DeliveryOrderResponseDTO): boolean {
    return assignment.assignmentStatus === DeliveryStatus.Assigned;
  }

  canDeliver(assignment: DeliveryOrderResponseDTO): boolean {
    return assignment.assignmentStatus === DeliveryStatus.PickedUp;
  }

  updateStatus(assignment: DeliveryOrderResponseDTO, status: DeliveryStatus): void {
    this.updatingId = assignment.assignmentId;
    const dto: UpdateDeliveryStatusDTO = { status };

    this.deliveryService.updateDeliveryStatus(assignment.assignmentId, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          const idx = this.assignments.findIndex(a => a.assignmentId === assignment.assignmentId);
          if (idx > -1) {
            this.assignments = [
              ...this.assignments.slice(0, idx),
              updated,
              ...this.assignments.slice(idx + 1)
            ];
            this.sortAssignments();
          }
          this.updatingId = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to update status.';
          this.updatingId = null;
          this.cdr.detectChanges();
        }
      });
  }

  markPaymentPaid(assignment: DeliveryOrderResponseDTO): void {
    if (this.updatingId === assignment.assignmentId) return;
    this.updatingId = assignment.assignmentId;
    
    this.deliveryService.updatePaymentStatus(assignment.assignmentId, { status: 'Completed' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          const idx = this.assignments.findIndex(a => a.assignmentId === assignment.assignmentId);
          if (idx > -1) {
            this.assignments = [
              ...this.assignments.slice(0, idx),
              updated,
              ...this.assignments.slice(idx + 1)
            ];
            this.sortAssignments();
          }
          this.updatingId = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to update payment status.';
          this.updatingId = null;
          this.cdr.detectChanges();
        }
      });
  }

  getStopStatusClass(status: string): string {
    const map: Record<string, string> = {
      [RestaurantOrderStatus.ReadyForPickup]: 'text-green-700',
      [RestaurantOrderStatus.Preparing]:      'text-yellow-700',
      [RestaurantOrderStatus.Pending]:        'text-gray-600',
      [RestaurantOrderStatus.PickedUp]:       'text-[#44e2cd]',
    };
    return map[status] ?? 'text-gray-600';
  }

  getAssignmentStatusClass(status: string): string {
    const map: Record<string, string> = {
      [DeliveryStatus.Assigned]:  'bg-blue-50 border-blue-200 text-blue-700',
      [DeliveryStatus.PickedUp]:  'bg-purple-50 border-purple-200 text-purple-700',
      [DeliveryStatus.Delivered]: 'bg-green-50 border-green-200 text-green-700',
    };
    return map[status] ?? 'bg-gray-50 border-gray-200 text-gray-700';
  }

  /** Returns the agent's earning for a single assignment (exposed for template). */
  deliveryEarning(totalAmount: number): number {
    return Math.round(totalAmount * DELIVERY_COMMISSION_RATE * 100) / 100;
  }

  private sortAssignments(): void {
    const statusPriority: Record<string, number> = {
      [DeliveryStatus.Assigned]: 0,
      [DeliveryStatus.PickedUp]: 1,
      [DeliveryStatus.Delivered]: 2
    };

    this.assignments.sort((a, b) => {
      const priorityA = statusPriority[a.assignmentStatus] ?? 3;
      const priorityB = statusPriority[b.assignmentStatus] ?? 3;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Secondary sort by date (newest first)
      const timeA = a.assignmentStatus === DeliveryStatus.Delivered 
        ? (a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0)
        : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        
      const timeB = b.assignmentStatus === DeliveryStatus.Delivered 
        ? (b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0)
        : (b.createdAt ? new Date(b.createdAt).getTime() : 0);

      return timeB - timeA;
    });
  }
}
