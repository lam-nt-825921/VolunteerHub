import { Component, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EventsService, RegistrationResponse } from '../../../services/events.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

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
  currentParticipants: RegistrationResponse[] = []; // Approved + Attended
  selectedPendingIds = signal<Set<number>>(new Set());
  selectAllPending = signal(false);
  isLoading = signal(false);

  constructor(
    private eventsService: EventsService,
    public authService: AuthService,
    private alertService: AlertService
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
      this.currentParticipants = [...this.approvedRegistrations, ...this.attendedRegistrations];
      this.selectedPendingIds.set(new Set());
      this.selectAllPending.set(false);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleSelectPending(registrationId: number) {
    const selected = new Set(this.selectedPendingIds());
    if (selected.has(registrationId)) {
      selected.delete(registrationId);
    } else {
      selected.add(registrationId);
    }
    this.selectedPendingIds.set(selected);
    this.updateSelectAllState();
  }

  toggleSelectAllPending() {
    const selectAll = !this.selectAllPending();
    this.selectAllPending.set(selectAll);
    if (selectAll) {
      this.selectedPendingIds.set(new Set(this.pendingRegistrations.map(r => r.id)));
    } else {
      this.selectedPendingIds.set(new Set());
    }
  }

  updateSelectAllState() {
    const selected = this.selectedPendingIds();
    this.selectAllPending.set(
      this.pendingRegistrations.length > 0 &&
      this.pendingRegistrations.every(r => selected.has(r.id))
    );
  }

  isPendingSelected(registrationId: number): boolean {
    return this.selectedPendingIds().has(registrationId);
  }

  get selectedPendingCount(): number {
    return this.selectedPendingIds().size;
  }

  async approveRegistration(registrationId: number) {
    this.isLoading.set(true);
    try {
      const result = await this.eventsService.approveRegistration(this.eventId, registrationId);
      if (result.success) {
        this.alertService.showSuccess(result.message);
        await this.loadRegistrations();
      } else {
        this.alertService.showError(result.message);
      }
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Duyệt đăng ký thất bại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async bulkApprovePending() {
    const selectedIds = Array.from(this.selectedPendingIds());
    if (selectedIds.length === 0) {
      this.alertService.showWarning('Vui lòng chọn ít nhất một đăng ký để duyệt!');
      return;
    }

    if (!confirm(`Bạn có chắc muốn duyệt ${selectedIds.length} đăng ký đã chọn?`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      const promises = selectedIds.map(id => 
        this.eventsService.approveRegistration(this.eventId, id)
      );
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      this.alertService.showSuccess(`Đã duyệt thành công ${successCount}/${selectedIds.length} đăng ký!`);
      await this.loadRegistrations();
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Duyệt đăng ký thất bại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async rejectRegistration(registrationId: number) {
    if (confirm('Bạn có chắc muốn từ chối đăng ký này?')) {
      this.isLoading.set(true);
      try {
        const result = await this.eventsService.rejectRegistration(this.eventId, registrationId);
        if (result.success) {
          this.alertService.showSuccess(result.message);
          await this.loadRegistrations();
        } else {
          this.alertService.showError(result.message);
        }
      } catch (error: any) {
        this.alertService.showError(error?.message || 'Từ chối đăng ký thất bại!');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async bulkRejectPending() {
    const selectedIds = Array.from(this.selectedPendingIds());
    if (selectedIds.length === 0) {
      this.alertService.showWarning('Vui lòng chọn ít nhất một đăng ký để từ chối!');
      return;
    }

    if (!confirm(`Bạn có chắc muốn từ chối ${selectedIds.length} đăng ký đã chọn?`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      const promises = selectedIds.map(id => 
        this.eventsService.rejectRegistration(this.eventId, id)
      );
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      this.alertService.showSuccess(`Đã từ chối thành công ${successCount}/${selectedIds.length} đăng ký!`);
      await this.loadRegistrations();
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Từ chối đăng ký thất bại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async kickParticipant(registrationId: number) {
    if (confirm('Bạn có chắc muốn xóa người tham gia này?')) {
      this.isLoading.set(true);
      try {
        const result = await this.eventsService.kickParticipant(this.eventId, registrationId);
        if (result.success) {
          this.alertService.showSuccess(result.message);
          await this.loadRegistrations();
        } else {
          this.alertService.showError(result.message);
        }
      } catch (error: any) {
        this.alertService.showError(error?.message || 'Xóa người tham gia thất bại!');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async checkIn(registrationId: number) {
    this.isLoading.set(true);
    try {
      const result = await this.eventsService.checkInParticipant(this.eventId, registrationId);
      if (result.success) {
        this.alertService.showSuccess(result.message);
        await this.loadRegistrations();
      } else {
        this.alertService.showError(result.message);
      }
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Điểm danh thất bại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  exportToCSV() {
    const headers = ['ID', 'Tên', 'Email', 'Trạng thái', 'Ngày đăng ký', 'Ngày điểm danh'];
    const rows = this.registrations.map(r => [
      r.id.toString(),
      r.user.fullName,
      '', // Email not available in RegistrationResponse
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

  getInitials(fullName: string): string {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }
}
