import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONFIG } from './api.config';

// ============ ENUMS ============
export type EventStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type EventVisibility = 'PUBLIC' | 'INTERNAL' | 'PRIVATE';

// ============ INTERFACES ============

export interface EventCategory {
  id: number;
  name: string;
  slug: string;
}

export interface EventCreator {
  fullName: string;
  avatar: string | null;
  reputationScore?: number;
}

export interface EventResponse {
  id: number;
  title: string;
  description: string;
  location: string;
  coverImage: string | null;
  startTime: string;
  endTime: string;
  status: EventStatus;
  visibility: EventVisibility;
  viewCount: number;
  duration?: number;
  createdAt: string;
  updatedAt?: string;
  creatorId?: number;
  creator?: EventCreator;
  category: EventCategory | null;
  _count?: {
    registrations: number;
    posts?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Request DTOs
export interface FilterEventsRequest {
  keyword?: string;
  status?: EventStatus | EventStatus[];
  from?: string;
  to?: string;
  visibility?: EventVisibility;
  categoryId?: number;
  page?: number;
  limit?: number;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  coverImage?: string;
  visibility?: EventVisibility;
  categoryId?: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  coverImage?: string | null;
  visibility?: EventVisibility;
  categoryId?: number | null;
}

export interface UpdateEventStatusRequest {
  status: EventStatus;
  note?: string;
}

export interface InviteCodeResponse {
  inviteCode: string;
}

/**
 * Events API Service
 * Handles all event-related API calls
 * 
 * Permissions:
 * - GET /events/public: Anyone (no auth)
 * - GET /events/:id: Anyone (limited info for guests)
 * - GET /events: VOLUNTEER, EVENT_MANAGER, ADMIN
 * - POST /events: EVENT_MANAGER, ADMIN
 * - PATCH /events/:id: Creator or ADMIN
 * - PATCH /events/:id/status: EVENT_MANAGER (own events), ADMIN (all events)
 * - GET /events/:id/invite-code: Creator or ADMIN (PRIVATE events only)
 */
@Injectable({
  providedIn: 'root'
})
export class EventsApiService {
  constructor(private apiService: ApiService) {}

  /**
   * Get public events (no authentication required)
   * Anyone can access this endpoint
   */
  getPublicEvents(filter?: FilterEventsRequest): Observable<PaginatedResponse<EventResponse>> {
    const queryString = this.buildQueryString(filter);
    const url = `${API_CONFIG.endpoints.events.public}${queryString}`;
    return this.apiService.get<PaginatedResponse<EventResponse>>(url, false);
  }

  /**
   * Get all events (authentication required)
   * - VOLUNTEER: sees approved PUBLIC & INTERNAL events
   * - EVENT_MANAGER/ADMIN: sees all events with filters
   */
  getEvents(filter?: FilterEventsRequest): Observable<PaginatedResponse<EventResponse>> {
    const queryString = this.buildQueryString(filter);
    const url = `${API_CONFIG.endpoints.events.base}${queryString}`;
    return this.apiService.get<PaginatedResponse<EventResponse>>(url, true);
  }

  /**
   * Get pending events for admin approval
   * Only ADMIN can access this effectively
   */
  getPendingEvents(filter?: Omit<FilterEventsRequest, 'status'>): Observable<PaginatedResponse<EventResponse>> {
    return this.getEvents({ ...filter, status: 'PENDING' });
  }

  /**
   * Get a single event by ID
   * Public endpoint but returns more info for authenticated users
   */
  getEventById(eventId: number, authenticated: boolean = true): Observable<EventResponse> {
    const url = API_CONFIG.endpoints.events.byId.replace(':id', eventId.toString());
    return this.apiService.get<EventResponse>(url, authenticated);
  }

  /**
   * Create a new event
   * Only EVENT_MANAGER and ADMIN can create events
   * New events start with status: PENDING
   */
  createEvent(data: CreateEventRequest, coverImageFile?: File): Observable<EventResponse> {
    const url = API_CONFIG.endpoints.events.base;
    
    // If coverImageFile is provided, use FormData; otherwise use JSON
    if (coverImageFile) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('location', data.location);
      formData.append('startTime', data.startTime);
      formData.append('endTime', data.endTime);
      if (data.visibility) {
        formData.append('visibility', data.visibility);
      }
      if (data.categoryId) {
        formData.append('categoryId', data.categoryId.toString());
      }
      // Append file with field name 'coverImage' (backend expects this)
      formData.append('coverImage', coverImageFile);
      return this.apiService.post<EventResponse>(url, formData, true, true);
    } else {
      // No file, send JSON (coverImage can be URL string)
      return this.apiService.post<EventResponse>(url, data, true);
    }
  }

  /**
   * Update an existing event
   * Only the creator or ADMIN can update
   */
  updateEvent(eventId: number, data: UpdateEventRequest, coverImageFile?: File): Observable<EventResponse> {
    const url = API_CONFIG.endpoints.events.byId.replace(':id', eventId.toString());
    
    // If coverImageFile is provided, use FormData; otherwise use JSON
    if (coverImageFile) {
      const formData = new FormData();
      if (data.title) {
        formData.append('title', data.title);
      }
      if (data.description) {
        formData.append('description', data.description);
      }
      if (data.location) {
        formData.append('location', data.location);
      }
      if (data.startTime) {
        formData.append('startTime', data.startTime);
      }
      if (data.endTime) {
        formData.append('endTime', data.endTime);
      }
      if (data.visibility) {
        formData.append('visibility', data.visibility);
      }
      if (data.categoryId !== undefined && data.categoryId !== null) {
        formData.append('categoryId', data.categoryId.toString());
      }
      // Append file with field name 'coverImage' (backend expects this)
      formData.append('coverImage', coverImageFile);
      return this.apiService.patch<EventResponse>(url, formData, true, true);
    } else {
      // No file, send JSON (coverImage can be URL string or null to remove)
      return this.apiService.patch<EventResponse>(url, data, true);
    }
  }

  /**
   * Update event status (approve, reject, cancel, complete)
   * 
   * Status transitions:
   * - PENDING → APPROVED: ADMIN only
   * - PENDING → REJECTED: ADMIN only
   * - PENDING → CANCELLED: Creator or ADMIN
   * - APPROVED → CANCELLED: Creator or ADMIN
   * - APPROVED → COMPLETED: Creator or ADMIN
   * - REJECTED, CANCELLED, COMPLETED: No further transitions
   */
  updateEventStatus(eventId: number, data: UpdateEventStatusRequest): Observable<EventResponse> {
    const url = API_CONFIG.endpoints.events.status.replace(':id', eventId.toString());
    return this.apiService.patch<EventResponse>(url, data, true);
  }

  /**
   * Approve an event (ADMIN only)
   */
  approveEvent(eventId: number, note?: string): Observable<EventResponse> {
    return this.updateEventStatus(eventId, { status: 'APPROVED', note });
  }

  /**
   * Reject an event (ADMIN only)
   */
  rejectEvent(eventId: number, note?: string): Observable<EventResponse> {
    return this.updateEventStatus(eventId, { status: 'REJECTED', note });
  }

  /**
   * Cancel an event (Creator or ADMIN)
   */
  cancelEvent(eventId: number, note?: string): Observable<EventResponse> {
    return this.updateEventStatus(eventId, { status: 'CANCELLED', note });
  }

  /**
   * Mark event as completed (Creator or ADMIN)
   */
  completeEvent(eventId: number, note?: string): Observable<EventResponse> {
    return this.updateEventStatus(eventId, { status: 'COMPLETED', note });
  }

  /**
   * Get invite code for PRIVATE events
   * Only the creator or ADMIN can get the invite code
   * Event must be APPROVED and currently active
   */
  getInviteCode(eventId: number): Observable<InviteCodeResponse> {
    const url = API_CONFIG.endpoints.events.inviteCode.replace(':id', eventId.toString());
    return this.apiService.get<InviteCodeResponse>(url, true);
  }

  /**
   * Helper: Build query string from filter object
   */
  private buildQueryString(filter?: FilterEventsRequest): string {
    if (!filter) return '';
    
    const params = new URLSearchParams();
    
    if (filter.keyword) params.append('keyword', filter.keyword);
    if (filter.from) params.append('from', filter.from);
    if (filter.to) params.append('to', filter.to);
    if (filter.visibility) params.append('visibility', filter.visibility);
    if (filter.categoryId) params.append('categoryId', filter.categoryId.toString());
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.limit) params.append('limit', filter.limit.toString());
    
    // Handle status (can be single or array)
    if (filter.status) {
      if (Array.isArray(filter.status)) {
        filter.status.forEach(s => params.append('status', s));
      } else {
        params.append('status', filter.status);
      }
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }
}


