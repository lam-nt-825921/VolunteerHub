import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
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
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  registeredAt: string;
  approvedAt?: string;
  completedAt?: string;
  volunteerHours?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private events = signal<Event[]>([]);
  private registrations = signal<EventRegistration[]>([]);

  public readonly eventsList = this.events.asReadonly();
  public readonly registrationsList = this.registrations.asReadonly();

  constructor(private apiService: ApiService) {
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockEvents: Event[] = [
      {
        id: 1,
        title: 'Dọn dẹp bãi biển Vũng Tàu',
        description: 'Tham gia dọn dẹp rác thải tại bãi biển Vũng Tàu để bảo vệ môi trường biển.',
        startDate: '2024-12-20T08:00:00',
        endDate: '2024-12-20T12:00:00',
        location: 'Bãi biển Vũng Tàu, Bà Rịa - Vũng Tàu',
        category: 'Môi trường',
        status: 'approved',
        maxParticipants: 50,
        currentParticipants: 32,
        managerId: 1,
        managerName: 'Lê Văn C',
        createdAt: '2024-12-01T10:00:00',
        approvedAt: '2024-12-02T09:00:00'
      },
      {
        id: 2,
        title: 'Dạy học cho trẻ em vùng cao',
        description: 'Tình nguyện dạy học cho trẻ em tại các vùng cao, giúp các em có cơ hội học tập tốt hơn.',
        startDate: '2024-12-25T07:00:00',
        endDate: '2024-12-25T17:00:00',
        location: 'Xã Đồng Văn, Hà Giang',
        category: 'Giáo dục',
        status: 'approved',
        maxParticipants: 30,
        currentParticipants: 18,
        managerId: 1,
        managerName: 'Lê Văn C',
        createdAt: '2024-12-05T10:00:00',
        approvedAt: '2024-12-06T09:00:00'
      },
      {
        id: 3,
        title: 'Hiến máu nhân đạo',
        description: 'Chương trình hiến máu nhân đạo tại bệnh viện địa phương.',
        startDate: '2024-12-22T08:00:00',
        endDate: '2024-12-22T16:00:00',
        location: 'Bệnh viện Đa khoa TP.HCM',
        category: 'Y tế',
        status: 'approved',
        maxParticipants: 100,
        currentParticipants: 65,
        managerId: 2,
        managerName: 'Phạm Thị D',
        createdAt: '2024-12-10T10:00:00',
        approvedAt: '2024-12-11T09:00:00'
      },
      {
        id: 4,
        title: 'Trồng cây xanh tại công viên',
        description: 'Tham gia trồng cây xanh tại công viên thành phố để tạo không gian xanh.',
        startDate: '2024-12-28T07:00:00',
        endDate: '2024-12-28T11:00:00',
        location: 'Công viên Lê Văn Tám, TP.HCM',
        category: 'Môi trường',
        status: 'pending',
        maxParticipants: 40,
        currentParticipants: 0,
        managerId: 2,
        managerName: 'Phạm Thị D',
        createdAt: '2024-12-15T10:00:00'
      }
    ];

    this.events.set(mockEvents);
  }

  getAllEvents(): Event[] {
    return this.events();
  }

  getEventById(id: number): Event | undefined {
    return this.events().find(e => e.id === id);
  }

  getApprovedEvents(): Event[] {
    return this.events().filter(e => e.status === 'approved');
  }

  getEventsByManager(managerId: number): Event[] {
    return this.events().filter(e => e.managerId === managerId);
  }

  getPendingEvents(): Event[] {
    return this.events().filter(e => e.status === 'pending');
  }

  registerForEvent(eventId: number, userId: number): { success: boolean; message: string } {
    const event = this.getEventById(eventId);
    if (!event) {
      return { success: false, message: 'Sự kiện không tồn tại!' };
    }

    if (event.status !== 'approved') {
      return { success: false, message: 'Sự kiện chưa được duyệt!' };
    }

    if (event.currentParticipants >= event.maxParticipants) {
      return { success: false, message: 'Sự kiện đã đủ người tham gia!' };
    }

    // Check if already registered
    const existing = this.registrations().find(
      r => r.eventId === eventId && r.userId === userId
    );

    if (existing) {
      return { success: false, message: 'Bạn đã đăng ký sự kiện này!' };
    }

    const registration: EventRegistration = {
      id: Date.now(),
      eventId,
      userId,
      status: 'pending',
      registeredAt: new Date().toISOString()
    };

    this.registrations.update(regs => [...regs, registration]);
    event.currentParticipants++;

    return { success: true, message: 'Đăng ký thành công! Đang chờ duyệt.' };
  }

  cancelRegistration(eventId: number, userId: number): { success: boolean; message: string } {
    const registration = this.registrations().find(
      r => r.eventId === eventId && r.userId === userId
    );

    if (!registration) {
      return { success: false, message: 'Bạn chưa đăng ký sự kiện này!' };
    }

    const event = this.getEventById(eventId);
    if (event && new Date(event.startDate) <= new Date()) {
      return { success: false, message: 'Không thể hủy sau khi sự kiện đã bắt đầu!' };
    }

    this.registrations.update(regs => regs.filter(r => r.id !== registration.id));
    if (event) {
      event.currentParticipants--;
    }

    return { success: true, message: 'Hủy đăng ký thành công!' };
  }

  getUserRegistrations(userId: number): EventRegistration[] {
    return this.registrations().filter(r => r.userId === userId);
  }

  getUserUpcomingEvents(userId: number): Event[] {
    const userRegs = this.getUserRegistrations(userId)
      .filter(r => r.status === 'approved')
      .map(r => r.eventId);
    
    return this.events().filter(
      e => userRegs.includes(e.id) && new Date(e.startDate) > new Date()
    );
  }

  getUserJoinedEvents(userId: number): Event[] {
    const userRegs = this.getUserRegistrations(userId)
      .filter(r => r.status === 'approved' || r.status === 'completed')
      .map(r => r.eventId);
    
    return this.events().filter(e => userRegs.includes(e.id));
  }

  getTotalVolunteerHours(userId: number): number {
    return this.getUserRegistrations(userId)
      .filter(r => r.status === 'completed' && r.volunteerHours)
      .reduce((total, r) => total + (r.volunteerHours || 0), 0);
  }

  // Manager methods
  createEvent(event: Omit<Event, 'id' | 'createdAt' | 'status' | 'currentParticipants'>): Event {
    const newEvent: Event = {
      ...event,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      currentParticipants: 0
    };

    this.events.update(evts => [...evts, newEvent]);
    return newEvent;
  }

  updateEvent(eventId: number, updates: Partial<Event>): { success: boolean; message: string } {
    const event = this.getEventById(eventId);
    if (!event) {
      return { success: false, message: 'Sự kiện không tồn tại!' };
    }

    if (event.status === 'approved') {
      return { success: false, message: 'Không thể sửa sự kiện đã được duyệt!' };
    }

    Object.assign(event, updates);
    this.events.update(evts => evts.map(e => e.id === eventId ? event : e));

    return { success: true, message: 'Cập nhật sự kiện thành công!' };
  }

  deleteEvent(eventId: number): { success: boolean; message: string } {
    const event = this.getEventById(eventId);
    if (!event) {
      return { success: false, message: 'Sự kiện không tồn tại!' };
    }

    if (event.status === 'approved') {
      return { success: false, message: 'Không thể xóa sự kiện đã được duyệt!' };
    }

    this.events.update(evts => evts.filter(e => e.id !== eventId));
    this.registrations.update(regs => regs.filter(r => r.eventId !== eventId));

    return { success: true, message: 'Xóa sự kiện thành công!' };
  }

  // Admin methods - Event Approval/Rejection
  async approveEvent(eventId: number, adminId: number, note?: string): Promise<{ success: boolean; message: string }> {
    try {
      await firstValueFrom(
        this.apiService.patch(
          `/events/${eventId}/status`,
          {
            status: 'APPROVED',
            note: note || 'Sự kiện đã được duyệt'
          },
          true
        )
      );
      return { success: true, message: 'Duyệt sự kiện thành công!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Duyệt sự kiện thất bại. Vui lòng thử lại!' };
    }
  }

  async rejectEvent(eventId: number, note?: string): Promise<{ success: boolean; message: string }> {
    try {
      await firstValueFrom(
        this.apiService.patch(
          `/events/${eventId}/status`,
          {
            status: 'REJECTED',
            note: note || 'Sự kiện đã bị từ chối'
          },
          true
        )
      );
      return { success: true, message: 'Từ chối sự kiện thành công!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Từ chối sự kiện thất bại. Vui lòng thử lại!' };
    }
  }

  adminDeleteEvent(eventId: number): { success: boolean; message: string } {
    const event = this.getEventById(eventId);
    if (!event) {
      return { success: false, message: 'Sự kiện không tồn tại!' };
    }

    this.events.update(evts => evts.filter(e => e.id !== eventId));
    this.registrations.update(regs => regs.filter(r => r.eventId !== eventId));

    return { success: true, message: 'Xóa sự kiện thành công!' };
  }

  // Registration management
  getEventRegistrations(eventId: number): EventRegistration[] {
    return this.registrations().filter(r => r.eventId === eventId);
  }

  approveRegistration(registrationId: number): { success: boolean; message: string } {
    const registration = this.registrations().find(r => r.id === registrationId);
    if (!registration) {
      return { success: false, message: 'Đăng ký không tồn tại!' };
    }

    registration.status = 'approved';
    registration.approvedAt = new Date().toISOString();

    this.registrations.update(regs => regs.map(r => r.id === registrationId ? registration : r));

    return { success: true, message: 'Duyệt đăng ký thành công!' };
  }

  rejectRegistration(registrationId: number): { success: boolean; message: string } {
    const registration = this.registrations().find(r => r.id === registrationId);
    if (!registration) {
      return { success: false, message: 'Đăng ký không tồn tại!' };
    }

    registration.status = 'rejected';
    const event = this.getEventById(registration.eventId);
    if (event) {
      event.currentParticipants--;
    }

    this.registrations.update(regs => regs.map(r => r.id === registrationId ? registration : r));

    return { success: true, message: 'Từ chối đăng ký thành công!' };
  }

  markRegistrationComplete(registrationId: number, volunteerHours: number): { success: boolean; message: string } {
    const registration = this.registrations().find(r => r.id === registrationId);
    if (!registration) {
      return { success: false, message: 'Đăng ký không tồn tại!' };
    }

    registration.status = 'completed';
    registration.completedAt = new Date().toISOString();
    registration.volunteerHours = volunteerHours;

    this.registrations.update(regs => regs.map(r => r.id === registrationId ? registration : r));

    return { success: true, message: 'Đánh dấu hoàn thành thành công!' };
  }

  // Export methods
  exportEventsToCSV(): string {
    const events = this.events();
    const headers = ['ID', 'Tiêu đề', 'Mô tả', 'Ngày bắt đầu', 'Ngày kết thúc', 'Địa điểm', 'Danh mục', 'Trạng thái', 'Số người tham gia', 'Tối đa', 'Người tổ chức'];
    const rows = events.map(e => [
      e.id.toString(),
      e.title,
      e.description,
      e.startDate,
      e.endDate,
      e.location,
      e.category,
      e.status,
      e.currentParticipants.toString(),
      e.maxParticipants.toString(),
      e.managerName
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  exportRegistrationsToCSV(eventId: number): string {
    const registrations = this.getEventRegistrations(eventId);
    const headers = ['ID', 'Event ID', 'User ID', 'Trạng thái', 'Ngày đăng ký', 'Ngày duyệt', 'Ngày hoàn thành', 'Giờ tình nguyện'];
    const rows = registrations.map(r => [
      r.id.toString(),
      r.eventId.toString(),
      r.userId.toString(),
      r.status,
      r.registeredAt,
      r.approvedAt || '',
      r.completedAt || '',
      (r.volunteerHours || 0).toString()
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
}

