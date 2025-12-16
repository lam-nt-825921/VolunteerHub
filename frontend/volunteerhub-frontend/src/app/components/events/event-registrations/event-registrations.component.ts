import { Component, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EventsService, EventRegistration } from '../../../services/events.service';
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

  registrations: EventRegistration[] = [];
  pendingRegistrations: EventRegistration[] = [];
  approvedRegistrations: EventRegistration[] = [];
  completedRegistrations: EventRegistration[] = [];
  showCompleteForm = signal<number | null>(null);
  volunteerHours = signal<number>(0);

  constructor(
    private eventsService: EventsService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRegistrations();
  }

  loadRegistrations() {
    this.registrations = this.eventsService.getEventRegistrations(this.eventId);
    this.pendingRegistrations = this.registrations.filter(r => r.status === 'pending');
    this.approvedRegistrations = this.registrations.filter(r => r.status === 'approved');
    this.completedRegistrations = this.registrations.filter(r => r.status === 'completed');
  }

  approveRegistration(registrationId: number) {
    const result = this.eventsService.approveRegistration(registrationId);
    alert(result.message);
    if (result.success) {
      this.loadRegistrations();
    }
  }

  rejectRegistration(registrationId: number) {
    if (confirm('Bạn có chắc muốn từ chối đăng ký này?')) {
      const result = this.eventsService.rejectRegistration(registrationId);
      alert(result.message);
      if (result.success) {
        this.loadRegistrations();
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

  markComplete(registrationId: number) {
    const hours = this.volunteerHours();
    if (hours <= 0) {
      alert('Vui lòng nhập số giờ tình nguyện lớn hơn 0!');
      return;
    }

    const result = this.eventsService.markRegistrationComplete(registrationId, hours);
    alert(result.message);
    if (result.success) {
      this.closeCompleteForm();
      this.loadRegistrations();
    }
  }

  exportToCSV() {
    const csv = this.eventsService.exportRegistrationsToCSV(this.eventId);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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

  getUserName(userId: number): string {
    // In a real app, this would fetch from a users service
    return `User ${userId}`;
  }
}

