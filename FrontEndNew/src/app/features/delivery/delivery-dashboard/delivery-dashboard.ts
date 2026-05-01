import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeliveryService } from '../../../core/services/delivery.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  DeliveryOrderResponseDTO,
  DeliveryStatus,
  AgentProfileResponseDTO,
  UpdateDeliveryStatusDTO
} from '../../../shared/models/order.model';

/** Delivery agent earns 8% of the order total per delivery. */
const DELIVERY_COMMISSION_RATE = 0.08;

/** Returns the agent's cut for a given order amount. */
function deliveryEarning(totalAmount: number): number {
  return Math.floor(totalAmount * DELIVERY_COMMISSION_RATE * 100) / 100;
}

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './delivery-dashboard.html',
  styleUrl: './delivery-dashboard.css',
})
export class DeliveryDashboard implements OnInit, OnDestroy {

  agentName = 'Agent';
  today = new Date();

  profile: AgentProfileResponseDTO | null = null;
  assignments: DeliveryOrderResponseDTO[] = [];

  isLoadingAssignments = true;
  isLoadingProfile = true;

  // Active assignment = one that is Assigned or PickedUp
  get activeAssignment(): DeliveryOrderResponseDTO | null {
    return this.assignments.find(
      a => a.assignmentStatus === DeliveryStatus.Assigned || a.assignmentStatus === DeliveryStatus.PickedUp
    ) ?? null;
  }

  // Recently delivered (last 3)
  get recentDeliveries(): DeliveryOrderResponseDTO[] {
    return this.assignments
      .filter(a => a.assignmentStatus === DeliveryStatus.Delivered)
      .slice(0, 3);
  }

  // Stats derived from assignments
  get deliveriesToday(): number {
    const todayStr = new Date().toDateString();
    return this.assignments.filter(a =>
      a.assignmentStatus === DeliveryStatus.Delivered &&
      a.deliveredAt &&
      new Date(a.deliveredAt).toDateString() === todayStr
    ).length;
  }

  get totalEarningsToday(): number {
    const todayStr = new Date().toDateString();
    const total = this.assignments
      .filter(a =>
        a.assignmentStatus === DeliveryStatus.Delivered &&
        a.deliveredAt &&
        new Date(a.deliveredAt).toDateString() === todayStr
      )
      .reduce((sum, a) => sum + deliveryEarning(a.totalAmount), 0);
    return Number(total.toFixed(2));
  }

  /** Returns the agent's earning for a single assignment (exposed for template). */
  deliveryEarning(amount: number): number {
    return deliveryEarning(amount);
  }

  get completionRate(): number {
    const delivered = this.assignments.filter(a => a.assignmentStatus === DeliveryStatus.Delivered).length;
    const total = this.assignments.length;
    if (total === 0) return 0;
    return Math.round((delivered / total) * 100);
  }

  updatingId: string | null = null;
  readonly DeliveryStatus = DeliveryStatus;

  private destroy$ = new Subject<void>();

  constructor(
    private deliveryService: DeliveryService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load agent name
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.agentName = user.fullName?.split(' ')[0] || user.email || 'Agent';
        }
        this.cdr.markForCheck();
      });

    // Load agent profile reactively
    this.deliveryService.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(p => {
        this.profile = p;
        this.isLoadingProfile = false;
        this.cdr.markForCheck();
      });

    this.loadAssignments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  loadAssignments(): void {
    this.isLoadingAssignments = true;
    this.deliveryService.getAssignments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.assignments = list;
          this.isLoadingAssignments = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.assignments = [];
          this.isLoadingAssignments = false;
          this.cdr.markForCheck();
        }
      });
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
          }
          this.updatingId = null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.updatingId = null;
          this.cdr.markForCheck();
        }
      });
  }

  canPickUp(a: DeliveryOrderResponseDTO): boolean {
    return a.assignmentStatus === DeliveryStatus.Assigned;
  }

  canDeliver(a: DeliveryOrderResponseDTO): boolean {
    return a.assignmentStatus === DeliveryStatus.PickedUp;
  }
}
