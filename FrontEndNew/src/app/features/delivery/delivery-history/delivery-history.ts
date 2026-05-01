import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeliveryService } from '../../../core/services/delivery.service';
import { DeliveryOrderResponseDTO, DeliveryStatus } from '../../../shared/models/order.model';

/** Delivery agent earns 8% of the order total per delivery. */
const DELIVERY_COMMISSION_RATE = 0.08;

@Component({
  selector: 'app-delivery-history',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './delivery-history.html',
  styleUrl: './delivery-history.css',
})
export class DeliveryHistory implements OnInit, OnDestroy {

  allAssignments: DeliveryOrderResponseDTO[] = [];
  isLoading = true;
  errorMessage = '';

  // Filter: 'all' | 'today' | 'week'
  selectedFilter: 'all' | 'today' | 'week' = 'all';

  readonly DeliveryStatus = DeliveryStatus;

  private destroy$ = new Subject<void>();

  constructor(
    private deliveryService: DeliveryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.deliveryService.getAssignments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          // Show all assignments (including delivered ones) as history
          this.allAssignments = list;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Failed to load delivery history.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  setFilter(f: 'all' | 'today' | 'week'): void {
    this.selectedFilter = f;
    this.cdr.markForCheck();
  }

  get filteredAssignments(): DeliveryOrderResponseDTO[] {
    const now = new Date();
    const filtered = this.allAssignments.filter(a => {
      const date = a.deliveredAt ? new Date(a.deliveredAt) : null;
      if (this.selectedFilter === 'today') {
        return date && date.toDateString() === now.toDateString();
      }
      if (this.selectedFilter === 'week') {
        if (!date) return false;
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }
      return true; // 'all'
    });

    return filtered.sort((a, b) => {
      const timeA = a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0;
      const timeB = b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  get deliveredCount(): number {
    return this.filteredAssignments.filter(a => a.assignmentStatus === DeliveryStatus.Delivered).length;
  }

  get totalFilteredEarnings(): number {
    const total = this.filteredAssignments
      .filter(a => a.assignmentStatus === DeliveryStatus.Delivered)
      .reduce((sum, a) => sum + this.deliveryEarning(a.totalAmount), 0);
    return Number(total.toFixed(2));
  }

  /** Returns the agent's earning for a single assignment (exposed for template). */
  deliveryEarning(totalAmount: number): number {
    return Math.floor(totalAmount * DELIVERY_COMMISSION_RATE * 100) / 100;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      [DeliveryStatus.Delivered]: 'border-green-200 bg-green-50 text-green-700',
      [DeliveryStatus.PickedUp]: 'border-purple-200 bg-purple-50 text-purple-700',
      [DeliveryStatus.Assigned]: 'border-blue-200 bg-blue-50 text-blue-700',
    };
    return map[status] ?? 'border-gray-200 bg-gray-50 text-gray-700';
  }
}
