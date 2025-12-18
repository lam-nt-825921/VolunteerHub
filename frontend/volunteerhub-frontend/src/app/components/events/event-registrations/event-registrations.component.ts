import { Component, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EventsService, RegistrationResponse } from '../../../services/events.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-event-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './event-registrations.component.html',
  styleUrl: './event-registrations.component.scss'
})
export class EventRegistrationsComponent implements OnInit {
  @Input() eventId!: number;
  @Input() canManage = false;

  registrations: RegistrationResponse[] = [];
  pendingRegistrations: RegistrationResponse[] = [];
  approvedRegistrations: RegistrationResponse[] = [];
  attendedRegistrations: RegistrationResponse[] = [];
  showCompleteForm = signal<number | null>(null);
  volunteerHours = signal<number>(0);
  isLoading = signal(false);

  constructor(
    private eventsService: EventsService,
    public authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadRegistrations();
  }

  async loadRegistrations() {
    this.isLoading.set(true);
    try {
      this.registrations = await this.eventsService.getEventRegistrations(this.eventId);
      this.pendingRegistrations = this.registrations.filter(r => r.status === 'PENDING');
      this.approvedRegistrations = this.registrations.filter(r => r.status === 'APPROVED');
      this.attendedRegistrations = this.registrations.filter(r => r.status === 'ATTENDED');
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async approveRegistration(registrationId: number) {
    this.isLoading.set(true);
    try {
      const result = await this.eventsService.approveRegistration(this.eventId, registrationId);
      alert(result.message);
      if (result.success) {
        await this.loadRegistrations();
      }
    } catch (error: any) {
      alert(error?.message || 'Duyệt đăng ký thất bại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async rejectRegistration(registrationId: number) {
    if (confirm('Bạn có chắc muốn từ chối đăng ký này?')) {
      this.isLoading.set(true);
      try {
        const result = await this.eventsService.rejectRegistration(this.eventId, registrationId);
        alert(result.message);
        if (result.success) {
          await this.loadRegistrations();
        }
      } catch (error: any) {
        alert(error?.message || 'Từ chối đăng ký thất bại!');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async kickParticipant(registrationId: number) {
    if (confirm('Bạn có chắc muốn xóa người tham gia này?')) {
      this.isLoading.set(true);
      try {
        const result = await this.eventsService.kickParticipant(this.eventId, registrationId);
        alert(result.message);
        if (result.success) {
          await this.loadRegistrations();
        }
      } catch (error: any) {
        alert(error?.message || 'Xóa người tham gia thất bại!');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  openCompleteForm(registrationId: number) {
    this.showCompleteForm.set(registrationId);
    this.volunteerHours.set(0);
  }

  closeCompleteForm() {
    this.showCompleteForm.set(null);
    this.volunteerHours.set(0);
  }

  async checkIn(registrationId: number) {
    this.isLoading.set(true);
    try {
      const result = await this.eventsService.checkInParticipant(this.eventId, registrationId);
      alert(result.message);
      if (result.success) {
        this.closeCompleteForm();
        await this.loadRegistrations();
      }
    } catch (error: any) {
      alert(error?.message || 'Điểm danh thất bại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  exportToCSV() {
    // Export registrations to CSV
    const headers = ['ID', 'Tên', 'Trạng thái', 'Ngày đăng ký', 'Ngày điểm danh'];
    const rows = this.registrations.map(r => [
      r.id.toString(),
      r.user.fullName,
      this.getStatusText(r.status),
      r.registeredAt,
      r.attendedAt || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations_event_${this.eventId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getUserName(registration: RegistrationResponse): string {
    return registration.user?.fullName || 'Unknown';
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Từ chối',
      'ATTENDED': 'Đã điểm danh',
      'KICKED': 'Đã xóa',
      'LEFT': 'Đã rời'
    };
    return statusMap[status] || status;
  }
}

