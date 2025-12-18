import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONFIG } from './api.config';
import { EventCategory, EventCreator, EventStatus, EventVisibility } from './events-api.service';
import { RegistrationStatus } from './registrations-api.service';

// ============ INTERFACES ============

export interface DashboardStats {
  totalEventsJoined: number;
  totalEventsCreated: number;
  totalHoursVolunteered: number;
  upcomingEventsCount: number;
  reputationScore: number;
  attendanceRate: number;
}

export interface DashboardEvent {
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
  createdAt: string;
  creator?: EventCreator;
  category: EventCategory | null;
  registrationsCount: number;
  isRegistered?: boolean;
  registrationStatus?: RegistrationStatus;
}

export interface ParticipationHistoryItem {
  id: number;
  status: RegistrationStatus;
  registeredAt: string;
  attendedAt: string | null;
  event: {
    id: number;
    title: string;
    description: string;
    location: string;
    coverImage: string | null;
    startTime: string;
    endTime: string;
    status: EventStatus;
    category: EventCategory | null;
  };
}

export interface AdminDashboardStats {
  totalEvents: number;
  completedEventsThisMonth: number;
  pendingEventsCount: number;
  totalUsers: number;
  activeUsersCount: number;
  registrationsThisMonth: number;
  eventsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    completed: number;
  };
  usersByRole: {
    volunteer: number;
    eventManager: number;
    admin: number;
  };
}

// Request DTOs
export interface FilterDashboardEventsRequest {
  keyword?: string;
  from?: string;
  to?: string;
  categoryId?: number;
  page?: number;
  limit?: number;
}

export type MyEventsType = 'created' | 'joined' | 'all';

/**
 * Dashboard API Service
 * Handles all dashboard-related API calls
 * 
 * All endpoints require authentication
 * Admin stats requires ADMIN role
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  constructor(private apiService: ApiService) {}

  /**
   * Get user dashboard statistics
   * Returns stats like total events joined, hours volunteered, etc.
   */
  getStats(): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>(API_CONFIG.endpoints.dashboard.stats, true);
  }

  /**
   * Get recommended events for the user
   * Based on user's interests and participation history
   */
  getRecommendedEvents(filter?: FilterDashboardEventsRequest): Observable<DashboardEvent[]> {
    const queryString = this.buildQueryString(filter);
    const url = `${API_CONFIG.endpoints.dashboard.recommendedEvents}${queryString}`;
    return this.apiService.get<DashboardEvent[]>(url, true);
  }

  /**
   * Get user's events
   * @param type - 'created' (events created by user), 'joined' (events user registered for), 'all'
   */
  getMyEvents(filter?: FilterDashboardEventsRequest, type: MyEventsType = 'all'): Observable<DashboardEvent[]> {
    const queryString = this.buildQueryString(filter);
    const typeParam = type !== 'all' ? `${queryString ? '&' : '?'}type=${type}` : '';
    const url = `${API_CONFIG.endpoints.dashboard.myEvents}${queryString}${typeParam}`;
    return this.apiService.get<DashboardEvent[]>(url, true);
  }

  /**
   * Get events created by the current user
   */
  getCreatedEvents(filter?: FilterDashboardEventsRequest): Observable<DashboardEvent[]> {
    return this.getMyEvents(filter, 'created');
  }

  /**
   * Get events the user has joined/registered for
   */
  getJoinedEvents(filter?: FilterDashboardEventsRequest): Observable<DashboardEvent[]> {
    return this.getMyEvents(filter, 'joined');
  }

  /**
   * Get upcoming events that the user has registered for
   */
  getUpcomingEvents(filter?: FilterDashboardEventsRequest): Observable<DashboardEvent[]> {
    const queryString = this.buildQueryString(filter);
    const url = `${API_CONFIG.endpoints.dashboard.upcomingEvents}${queryString}`;
    return this.apiService.get<DashboardEvent[]>(url, true);
  }

  /**
   * Get user's participation history
   * Shows all registrations with their status and event details
   */
  getParticipationHistory(filter?: FilterDashboardEventsRequest): Observable<ParticipationHistoryItem[]> {
    const queryString = this.buildQueryString(filter);
    const url = `${API_CONFIG.endpoints.dashboard.participationHistory}${queryString}`;
    return this.apiService.get<ParticipationHistoryItem[]>(url, true);
  }

  /**
   * Get admin dashboard statistics
   * Only accessible by ADMIN role
   * Returns system-wide stats like total events, users, etc.
   */
  getAdminStats(): Observable<AdminDashboardStats> {
    return this.apiService.get<AdminDashboardStats>(API_CONFIG.endpoints.dashboard.adminStats, true);
  }

  /**
   * Helper: Build query string from filter object
   */
  private buildQueryString(filter?: FilterDashboardEventsRequest): string {
    if (!filter) return '';
    
    const params = new URLSearchParams();
    
    if (filter.keyword) params.append('keyword', filter.keyword);
    if (filter.from) params.append('from', filter.from);
    if (filter.to) params.append('to', filter.to);
    if (filter.categoryId) params.append('categoryId', filter.categoryId.toString());
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.limit) params.append('limit', filter.limit.toString());

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }
}


