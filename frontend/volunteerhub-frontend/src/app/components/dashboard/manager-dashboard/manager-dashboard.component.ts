import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { EventsService, Event } from '../../../services/events.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { EventFormComponent } from '../../events/event-form/event-form.component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, NavbarComponent, FooterComponent, EventFormComponent],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss'
})
export class ManagerDashboardComponent implements OnInit {
  myEvents: Event[] = [];
  pendingEvents: Event[] = [];
  approvedEvents: Event[] = [];
  totalEvents = 0;
  totalParticipants = 0;
  showEventForm = signal(false);
  editingEvent = signal<Event | null>(null);

  constructor(
    public authService: AuthService,
    private eventsService: EventsService,
    private router: Router
  ) {}

  ngOnInit() {
    const userId = this.authService.user()?.id;
    if (userId) {
      this.myEvents = this.eventsService.getEventsByManager(userId);
      this.pendingEvents = this.myEvents.filter(e => e.status === 'pending');
      this.approvedEvents = this.myEvents.filter(e => e.status === 'approved');
      this.totalEvents = this.myEvents.length;
      this.totalParticipants = this.myEvents.reduce((sum, e) => sum + e.currentParticipants, 0);
    }
  }

  viewEventDetail(eventId: number) {
    this.router.navigate(['/events', eventId]);
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

  openCreateForm() {
    this.editingEvent.set(null);
    this.showEventForm.set(true);
  }

  openEditForm(event: Event) {
    this.editingEvent.set(event);
    this.showEventForm.set(true);
  }

  closeEventForm() {
    this.showEventForm.set(false);
    this.editingEvent.set(null);
  }

  onSaveEvent(eventData: Partial<Event>) {
    const user = this.authService.user();
    if (!user) return;

    if (this.editingEvent()) {
      const result = this.eventsService.updateEvent(this.editingEvent()!.id, eventData);
      if (result.success) {
        alert(result.message);
        this.closeEventForm();
        this.ngOnInit();
      } else {
        alert(result.message);
      }
    } else {
      const newEvent = this.eventsService.createEvent({
        ...eventData,
        managerId: user.id,
        managerName: user.name
      } as any);
      alert('Tạo sự kiện thành công! Đang chờ duyệt.');
      this.closeEventForm();
      this.ngOnInit();
    }
  }

  onDeleteEvent(event: Event) {
    if (confirm(`Bạn có chắc muốn xóa sự kiện "${event.title}"?`)) {
      const result = this.eventsService.deleteEvent(event.id);
      if (result.success) {
        alert(result.message);
        this.ngOnInit();
      } else {
        alert(result.message);
      }
    }
  }
}

