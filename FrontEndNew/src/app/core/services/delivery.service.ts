import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  DeliveryOrderResponseDTO,
  UpdateDeliveryStatusDTO,
  AgentProfileResponseDTO,
  UpsertAgentProfileDTO
} from '../../shared/models/order.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  private profileSubject = new BehaviorSubject<AgentProfileResponseDTO | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private api: ApiService) {}

  /**
   * Agent: get currently assigned orders with full pickup/dropoff details.
   */
  getAssignments(): Observable<DeliveryOrderResponseDTO[]> {
    return this.api.get<DeliveryOrderResponseDTO[]>(API_ENDPOINTS.DELIVERY.ASSIGNMENTS);
  }

  /**
   * Agent: update delivery status.
   */
  updateDeliveryStatus(assignmentId: string, dto: UpdateDeliveryStatusDTO): Observable<DeliveryOrderResponseDTO> {
    return this.api.put<DeliveryOrderResponseDTO>(API_ENDPOINTS.DELIVERY.UPDATE_STATUS(assignmentId), dto);
  }

  /**
   * Agent: update payment status (e.g., mark COD as Paid).
   */
  updatePaymentStatus(assignmentId: string, dto: { status: string }): Observable<DeliveryOrderResponseDTO> {
    return this.api.put<DeliveryOrderResponseDTO>(API_ENDPOINTS.DELIVERY.UPDATE_PAYMENT_STATUS(assignmentId), dto);
  }

  /**
   * Agent: get their profile.
   */
  getProfile(): Observable<AgentProfileResponseDTO> {
    return this.api.get<AgentProfileResponseDTO>(API_ENDPOINTS.DELIVERY.PROFILE)
      .pipe(
        tap(profile => this.profileSubject.next(profile))
      );
  }

  /**
   * Agent: create or update profile.
   */
  upsertProfile(dto: UpsertAgentProfileDTO): Observable<AgentProfileResponseDTO> {
    return this.api.put<AgentProfileResponseDTO>(API_ENDPOINTS.DELIVERY.PROFILE, dto)
      .pipe(
        tap(profile => this.profileSubject.next(profile))
      );
  }
}
