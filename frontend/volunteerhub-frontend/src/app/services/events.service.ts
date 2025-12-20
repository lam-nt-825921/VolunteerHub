import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { 
  EventsApiService, 
  EventResponse, 
  EventStatus, 
  EventVisibility,
  FilterEventsRequest, 
  CreateEventRequest, 
  UpdateEventRequest,
  PaginatedResponse 
} from './events-api.service';
import { 
  RegistrationsApiService, 
  RegistrationResponse, 
  RegistrationStatus 
} from './registrations-api.service';
import { 
  DashboardApiService, 
  DashboardStats, 
  DashboardEvent, 
  ParticipationHistoryItem,
  AdminDashboardStats,
  FilterDashboardEventsRequest
} from './dashboard-api.service';

// Re-export types for convenience
export type { 
  EventResponse, 
  EventStatus, 
  EventVisibility, 
  FilterEventsRequest,
  CreateEventRequest,
  UpdateEventRequest,
  PaginatedResponse,
  RegistrationResponse,
  RegistrationStatus,
  DashboardStats,
  DashboardEvent,
  ParticipationHistoryItem,
  AdminDashboardStats
};

// Legacy interface for backwards compatibility
export interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  maxParticipants: number;
  currentParticipants: number;
  imageUrl?: string;
  managerId: number;
  managerName: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: number;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'attended' | 'kicked' | 'left';
  registeredAt: string;
  approvedAt?: string;
  completedAt?: string;
  volunteerHours?: number;
}

/**
 * Events Service
 * High-level service that combines Events, Registrations, and Dashboard APIs
 * Provides a unified interface for components to interact with event-related functionality
 */
@Injectable({
  providedIn: 'root'
})
export class EventsService {
  // Local cache signals for reactive updates
  private eventsCache = signal<EventResponse[]>([]);
  private loadingState = signal<boolean>(false);
  
  public readonly events = this.eventsCache.asReadonly();
  public readonly isLoading = this.loadingState.asReadonly();

  constructor(
    private eventsApi: EventsApiService,
    private registrationsApi: RegistrationsApiService,
    private dashboardApi: DashboardApiService
  ) {}

  // ============ PUBLIC EVENTS (No Auth) ============

  /**
   * Get public events (no authentication required)
   */
  async getPublicEvents(filter?: FilterEventsRequest): Promise<PaginatedResponse<EventResponse>> {
    this.loadingState.set(true);
    try {
      const result = await firstValueFrom(this.eventsApi.getPublicEvents(filter));
      this.eventsCache.set(result.data);
      return result;
    } finally {
      this.loadingState.set(false);
    }
  }

  // ============ AUTHENTICATED EVENTS ============

  /**
   * Get all events (authentication required)
   */
  async getEvents(filter?: FilterEventsRequest): Promise<PaginatedResponse<EventResponse>> {
    this.loadingState.set(true);
    try {
      const result = await firstValueFrom(this.eventsApi.getEvents(filter));
      this.eventsCache.set(result.data);
      return result;
    } finally {
      this.loadingState.set(false);
    }
  }

  /**
   * Get pending events for admin approval
   */
  async getPendingEvents(filter?: Omit<FilterEventsRequest, 'status'>): Promise<PaginatedResponse<EventResponse>> {
    return firstValueFrom(this.eventsApi.getPendingEvents(filter));
  }

  /**
   * Get a single event by ID
   */
  async getEventById(eventId: number, authenticated: boolean = true): Promise<EventResponse> {
    return firstValueFrom(this.eventsApi.getEventById(eventId, authenticated));
  }

  // ============ EVENT MANAGEMENT (EVENT_MANAGER, ADMIN) ============

  /**
   * Create a new event
   * Only EVENT_MANAGER and ADMIN can create events
   */
  async createEvent(data: CreateEventRequest, coverImageFile?: File): Promise<{ success: boolean; message: string; event?: EventResponse }> {
    try {
      const event = await firstValueFrom(this.eventsApi.createEvent(data, coverImageFile));
      return { success: true, message: 'Tạo sự kiện thành công! Đang chờ duyệt.', event };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Tạo sự kiện thất bại. Vui lòng thử lại!' };
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: number, data: UpdateEventRequest, coverImageFile?: File): Promise<{ success: boolean; message: string; event?: EventResponse }> {
    try {
      const event = await firstValueFrom(this.eventsApi.updateEvent(eventId, data, coverImageFile));
      return { success: true, message: 'Cập nhật sự kiện thành công!', event };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Cập nhật sự kiện thất bại. Vui lòng thử lại!' };
    }
  }

  // ============ EVENT STATUS MANAGEMENT (ADMIN/CREATOR) ============

  /**
   * Approve an event (ADMIN only)
   */
  async approveEvent(eventId: number, note?: string): Promise<{ success: boolean; message: string }> {
    try {
      await firstValueFrom(this.eventsApi.approveEvent(eventId, note));
      return { success: true, message: 'Duyệt sự kiện thành công!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Duyệt sự kiện thất bại. Vui lòng thử lại!' };
    }
  }

  /**
   * Reject an event (ADMIN only)
   */
  async rejectEvent(eventId: number, note?: string): Promise<{ success: boolean; message: string }> {
    try {
      await firstValueFrom(this.eventsApi.rejectEvent(eventId, note));
      return { success: true, message: 'Từ chối sự kiện thành công!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Từ chối sự kiện thất bại. Vui lòng thử lại!' };
    }
  }

  /**
   * Cancel an event (Creator or ADMIN)
   */
  async cancelEvent(eventId: number, note?: string): Promise<{ success: boolean; message: string }> {
    try {
      await firstValueFrom(this.eventsApi.cancelEvent(eventId, note));
      return { success: true, message: 'Hủy sự kiện thành công!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Hủy sự kiện thất bại. Vui lòng thử lại!' };
    }
  }

  /**
   * Mark event as completed (Creator or ADMIN)
   */
  async completeEvent(eventId: number, note?: string): Promise<{ success: boolean; message: string }> {
    try {
      await firstValueFrom(this.eventsApi.completeEvent(eventId, note));
      return { success: true, message: 'Đánh dấu hoàn thành sự kiện thành công!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Đánh dấu hoàn thành thất bại. Vui lòng thử lại!' };
    }
  }

  /**
   * Get invite code for PRIVATE events
   */
  async getInviteCode(eventId: number): Promise<{ success: boolean; inviteCode?: string; message?: string }> {
    try {
      const result = await firstValueFrom(this.eventsApi.getInviteCode(eventId));
      return { success: true, inviteCode: result.inviteCode };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Không thể lấy mã mời. Vui lòng thử lại!' };
    }
  }

  // ============ REGISTRATION MANAGEMENT ============

  /**
   * Register for an event
   */
  async registerForEvent(eventId: number): Promise<{ success: boolean; message: string; registration?: RegistrationResponse }> {
    try {
      const registration = await firstValueFrom(this.registrationsApi.registerForEvent(eventId));
      return { success: true, message: 'Đăng ký tham gia thành công!', registration };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Đăng ký thất bại. Vui lòng thử lại!' };
    }
  }

  /**
   * Join a PRIVATE event by invite code
   */
  async joinByInviteCode(inviteCode: string): Promise<{ success: boolean; message: string; registration?: RegistrationResponse }> {
    try {
      const registration = await firstValueFrom(this.registrationsApi.joinByInviteCode({ inviteCode }));
      return { success: true, message: 'Tham gia sự kiện thành công!', registration };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Mã mời không hợp lệ hoặc đã hết hạn!' };
    }
  }

  /**
   * Leave an event
   */
  async leaveEvent(eventId: number): Promise<{ success: boolean; message: string }> {
    try {
      await firstValueFrom(this.registrationsApi.leaveEvent(eventId));
      return { success: true, message: 'Đã rời khỏi sự kiện!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Không thể rời sự kiện. Vui lòng thử lại!' };
    }
  }

  /**
   * Get event registrations (Creator or ADMIN)
   */
  async getEventRegistrations(eventId: number, status?: RegistrationStatus): Promise<RegistrationResponse[]> {
    return firstValueFrom(this.registrationsApi.getEventRegistrations(eventId, status));
  }

  /**
   * Approve a registration
   */
  async approveRegistration(eventId: number, registrationId: number): Promise<{ success: boolean; message: string }> {
    try {
      await firstValueFrom(this.registrationsApi.approveRegistration(eventId, registrationId));
      return { success: true, message: 'Duyệt đăng ký thành công!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Duyệt đăng ký thất bại!' };
    }
  }

  /**
   * Reject a registration
   */
  async rejectRegistration(eventId: number, registrationId: number): Promise<{ success: boolean; message: string }> {
    try {
      await firstValueFrom(this.registrationsApi.rejectRegistration(eventId, registrationId));
      return { success: true, message: 'Từ chối đăng ký thành công!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Từ chối đăng ký thất bại!' };
    }
  }

  /**
   * Kick a participant
   */
  async kickParticipant(eventId: number, registrationId: number): Promise<{ success: boolean; message: string }> {
    try {
      await firstValueFrom(this.registrationsApi.kickParticipant(eventId, registrationId));
      return { success: true, message: 'Đã xóa người tham gia khỏi sự kiện!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Xóa người tham gia thất bại!' };
    }
  }

  /**
   * Check-in a participant
   */
  async checkInParticipant(eventId: number, registrationId: number): Promise<{ success: boolean; message: string }> {
    try {
      await firstValueFrom(this.registrationsApi.checkIn(eventId, registrationId));
      return { success: true, message: 'Điểm danh thành công!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Điểm danh thất bại!' };
    }
  }

  // ============ DASHBOARD ============

  /**
   * Get user dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return firstValueFrom(this.dashboardApi.getStats());
  }

  /**
   * Get recommended events for the user
   */
  async getRecommendedEvents(filter?: FilterDashboardEventsRequest): Promise<DashboardEvent[]> {
    return firstValueFrom(this.dashboardApi.getRecommendedEvents(filter));
  }

  /**
   * Get user's events (created or joined)
   */
  async getMyEvents(filter?: FilterDashboardEventsRequest, type: 'created' | 'joined' | 'all' = 'all'): Promise<DashboardEvent[]> {
    return firstValueFrom(this.dashboardApi.getMyEvents(filter, type));
  }

  /**
   * Get upcoming events the user registered for
   */
  async getUpcomingEvents(filter?: FilterDashboardEventsRequest): Promise<DashboardEvent[]> {
    return firstValueFrom(this.dashboardApi.getUpcomingEvents(filter));
  }

  /**
   * Get participation history
   */
  async getParticipationHistory(filter?: FilterDashboardEventsRequest): Promise<ParticipationHistoryItem[]> {
    return firstValueFrom(this.dashboardApi.getParticipationHistory(filter));
  }

  /**
   * Get admin dashboard statistics (ADMIN only)
   */
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    return firstValueFrom(this.dashboardApi.getAdminStats());
  }

  // ============ UTILITY METHODS ============

  /**
   * Convert backend EventStatus to legacy status format
   */
  convertStatus(status: EventStatus): 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' {
    const statusMap: Record<EventStatus, 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'> = {
      'PENDING': 'pending',
      'APPROVED': 'approved',
      'REJECTED': 'rejected',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    };
    return statusMap[status] || 'pending';
  }

  /**
   * Convert legacy status to backend EventStatus format
   */
  convertToBackendStatus(status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'): EventStatus {
    const statusMap: Record<string, EventStatus> = {
      'pending': 'PENDING',
      'approved': 'APPROVED',
      'rejected': 'REJECTED',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED'
    };
    return statusMap[status] || 'PENDING';
  }

  /**
   * Convert EventResponse to legacy Event format for backwards compatibility
   */
  convertToLegacyEvent(event: EventResponse): Event {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startTime,
      endDate: event.endTime,
      location: event.location,
      category: event.category?.name || 'Chưa phân loại',
      status: this.convertStatus(event.status),
      maxParticipants: 100, // Backend doesn't have this field yet
      currentParticipants: event._count?.registrations || 0,
      imageUrl: event.coverImage || undefined,
      managerId: event.creatorId || 0,
      managerName: event.creator?.fullName || 'Unknown',
      createdAt: event.createdAt,
      approvedAt: event.status === 'APPROVED' ? event.updatedAt : undefined
    };
  }

  /**
   * Get status display text in Vietnamese
   */
  getStatusDisplayText(status: EventStatus | RegistrationStatus): string {
    const statusTexts: Record<string, string> = {
      'PENDING': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Đã từ chối',
      'CANCELLED': 'Đã hủy',
      'COMPLETED': 'Đã hoàn thành',
      'ATTENDED': 'Đã tham gia',
      'KICKED': 'Đã bị xóa',
      'LEFT': 'Đã rời'
    };
    return statusTexts[status] || status;
  }

  /**
   * Get visibility display text in Vietnamese
   */
  getVisibilityDisplayText(visibility: EventVisibility): string {
    const visibilityTexts: Record<EventVisibility, string> = {
      'PUBLIC': 'Công khai',
      'INTERNAL': 'Nội bộ',
      'PRIVATE': 'Riêng tư'
    };
    return visibilityTexts[visibility] || visibility;
  }
}

