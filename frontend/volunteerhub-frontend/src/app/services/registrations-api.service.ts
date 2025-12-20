import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONFIG } from './api.config';

// ============ ENUMS ============
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ATTENDED' | 'KICKED' | 'LEFT';

// ============ INTERFACES ============

export interface UserSummary {
  id: number;
  fullName: string;
  avatar: string | null;
  reputationScore: number;
}

export interface RegistrationResponse {
  id: number;
  status: RegistrationStatus;
  permissions: number;
  registeredAt: string;
  attendedAt: string | null;
  eventId: number;
  user: UserSummary;
}

// Request DTOs
export interface JoinByInviteCodeRequest {
  inviteCode: string;
}

export interface UpdateRegistrationStatusRequest {
  status: RegistrationStatus;
}

/**
 * Registrations API Service
 * Handles all registration-related API calls
 * 
 * Permissions:
 * - POST /registrations/:eventId: VOLUNTEER, EVENT_MANAGER, ADMIN (register for PUBLIC/INTERNAL events)
 * - POST /registrations/join-by-code: VOLUNTEER, EVENT_MANAGER, ADMIN (join PRIVATE events)
 * - GET /registrations/:eventId: Creator or ADMIN (list registrations)
 * - PATCH /registrations/:eventId/:registrationId/status: Creator or ADMIN
 * - POST /registrations/:eventId/:registrationId/check-in: Creator or ADMIN
 * - POST /registrations/:eventId/leave: VOLUNTEER, EVENT_MANAGER, ADMIN (self)
 */
@Injectable({
  providedIn: 'root'
})
export class RegistrationsApiService {
  constructor(private apiService: ApiService) {}

  /**
   * Register for an event (PUBLIC/INTERNAL events)
   * - Event must be APPROVED
   * - Event must not have ended
   * - User must not be KICKED or REJECTED from this event
   * 
   * Returns existing registration if already registered
   */
  registerForEvent(eventId: number): Observable<RegistrationResponse> {
    const url = API_CONFIG.endpoints.registrations.register.replace(':eventId', eventId.toString());
    return this.apiService.post<RegistrationResponse>(url, {}, true);
  }

  /**
   * Join a PRIVATE event using an invite code
   * - Invite code must be valid and not expired
   * - Event must be APPROVED
   * - Event must be currently active (started but not ended)
   */
  joinByInviteCode(data: JoinByInviteCodeRequest): Observable<RegistrationResponse> {
    return this.apiService.post<RegistrationResponse>(
      API_CONFIG.endpoints.registrations.joinByCode, 
      data, 
      true
    );
  }

  /**
   * Get registrations for an event
   * Only the event creator or ADMIN can view this
   * 
   * @param eventId - Event ID
   * @param status - Optional status filter (e.g., 'PENDING' for pending approvals)
   */
  getEventRegistrations(eventId: number, status?: RegistrationStatus): Observable<RegistrationResponse[]> {
    let url = API_CONFIG.endpoints.registrations.list.replace(':eventId', eventId.toString());
    if (status) {
      url += `?status=${status}`;
    }
    return this.apiService.get<RegistrationResponse[]>(url, true);
  }

  /**
   * Get pending registrations for an event (shorthand)
   */
  getPendingRegistrations(eventId: number): Observable<RegistrationResponse[]> {
    return this.getEventRegistrations(eventId, 'PENDING');
  }

  /**
   * Get approved registrations for an event (shorthand)
   */
  getApprovedRegistrations(eventId: number): Observable<RegistrationResponse[]> {
    return this.getEventRegistrations(eventId, 'APPROVED');
  }

  /**
   * Update registration status (APPROVED, REJECTED, KICKED)
   * Only the event creator or ADMIN can update
   */
  updateRegistrationStatus(
    eventId: number, 
    registrationId: number, 
    data: UpdateRegistrationStatusRequest
  ): Observable<RegistrationResponse> {
    const url = API_CONFIG.endpoints.registrations.updateStatus
      .replace(':eventId', eventId.toString())
      .replace(':registrationId', registrationId.toString());
    return this.apiService.patch<RegistrationResponse>(url, data, true);
  }

  /**
   * Approve a registration
   */
  approveRegistration(eventId: number, registrationId: number): Observable<RegistrationResponse> {
    return this.updateRegistrationStatus(eventId, registrationId, { status: 'APPROVED' });
  }

  /**
   * Reject a registration
   */
  rejectRegistration(eventId: number, registrationId: number): Observable<RegistrationResponse> {
    return this.updateRegistrationStatus(eventId, registrationId, { status: 'REJECTED' });
  }

  /**
   * Kick a participant from an event
   */
  kickParticipant(eventId: number, registrationId: number): Observable<RegistrationResponse> {
    return this.updateRegistrationStatus(eventId, registrationId, { status: 'KICKED' });
  }

  /**
   * Check-in a participant (mark as ATTENDED)
   * Only the event creator or ADMIN can check-in participants
   * Participant must be in APPROVED status
   */
  checkIn(eventId: number, registrationId: number): Observable<RegistrationResponse> {
    const url = API_CONFIG.endpoints.registrations.checkIn
      .replace(':eventId', eventId.toString())
      .replace(':registrationId', registrationId.toString());
    return this.apiService.post<RegistrationResponse>(url, {}, true);
  }

  /**
   * Leave an event (self-removal)
   * User can only leave if not KICKED or REJECTED
   */
  leaveEvent(eventId: number): Observable<RegistrationResponse> {
    const url = API_CONFIG.endpoints.registrations.leave.replace(':eventId', eventId.toString());
    return this.apiService.post<RegistrationResponse>(url, {}, true);
  }
}


