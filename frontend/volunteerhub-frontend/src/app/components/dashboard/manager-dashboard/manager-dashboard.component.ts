import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { EventsService, EventResponse, DashboardEvent } from '../../../services/events.service';
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
  myEvents: DashboardEvent[] = [];
  pendingEvents: DashboardEvent[] = [];
  approvedEvents: DashboardEvent[] = [];
  totalEvents = 0;
  totalParticipants = 0;
  showEventForm = signal(false);
  editingEvent = signal<DashboardEvent | null>(null);
  isLoading = signal(false);

  constructor(
    public authService: AuthService,
    private eventsService: EventsService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadEvents();
  }

  async loadEvents() {
    this.isLoading.set(true);
    try {
      // Get events created by the current user
      this.myEvents = await this.eventsService.getMyEvents(undefined, 'created');
      this.pendingEvents = this.myEvents.filter(e => e.status === 'PENDING');
      this.approvedEvents = this.myEvents.filter(e => e.status === 'APPROVED');
      this.totalEvents = this.myEvents.length;
      this.totalParticipants = this.myEvents.reduce((sum, e) => sum + (e.registrationsCount || 0), 0);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  viewEventDetail(eventId: number) {
    this.router.navigate(['/events', eventId, 'manage']);
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

  openEditForm(event: DashboardEvent) {
    this.editingEvent.set(event);
    this.showEventForm.set(true);
  }

  closeEventForm() {
    this.showEventForm.set(false);
    this.editingEvent.set(null);
  }

  async onSaveEvent(eventData: any) {
    const user = this.authService.user();
    if (!user) return;

    this.isLoading.set(true);
    try {
      if (this.editingEvent()) {
        const updateData: any = {
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          startTime: eventData.startDate || eventData.startTime,
          endTime: eventData.endDate || eventData.endTime,
          visibility: eventData.visibility || 'PUBLIC',
        };
        
        // Only include coverImage if it's provided
        if (eventData.imageUrl || eventData.coverImage) {
          updateData.coverImage = eventData.imageUrl || eventData.coverImage;
        }
        
        // Only include categoryId if provided
        if (eventData.categoryId) {
          updateData.categoryId = eventData.categoryId;
        }
        
        const result = await this.eventsService.updateEvent(this.editingEvent()!.id, updateData);
        alert(result.message);
        if (result.success) {
          this.closeEventForm();
          await this.loadEvents();
        }
      } else {
        // Map category name to categoryId (if category API exists, use that)
        // For now, categoryId is optional in backend, so we'll leave it undefined
        const categoryId = eventData.categoryId || undefined;
        
        const result = await this.eventsService.createEvent({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          startTime: eventData.startDate || eventData.startTime,
          endTime: eventData.endDate || eventData.endTime,
          coverImage: eventData.imageUrl || eventData.coverImage || undefined,
          visibility: eventData.visibility || 'PUBLIC',
          categoryId: categoryId
        });
        
        if (result.success && result.event) {
          // Automatically register the manager as a participant in their own event
          try {
            await this.eventsService.registerForEvent(result.event.id);
            // Registration successful - manager is now a participant
          } catch (regError: any) {
            // If registration fails (e.g., already registered), that's okay
            // The manager can still manage the event as creator
            console.warn('Could not auto-register manager for event:', regError);
          }
          
          alert('Tạo sự kiện thành công! Bạn đã được tự động đăng ký tham gia sự kiện này.');
          this.closeEventForm();
          await this.loadEvents();
        } else {
          alert(result.message);
        }
      }
    } catch (error: any) {
      alert(error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onCancelEvent(event: DashboardEvent) {
    if (confirm(`Bạn có chắc muốn hủy sự kiện "${event.title}"?`)) {
      this.isLoading.set(true);
      try {
        const result = await this.eventsService.cancelEvent(event.id);
        alert(result.message);
        if (result.success) {
          await this.loadEvents();
        }
      } catch (error: any) {
        alert(error?.message || 'Hủy sự kiện thất bại. Vui lòng thử lại!');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Từ chối',
      'CANCELLED': 'Đã hủy',
      'COMPLETED': 'Hoàn thành'
    };
    return statusMap[status] || status;
  }
}

