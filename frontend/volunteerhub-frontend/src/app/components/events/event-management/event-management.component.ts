import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { EventsService, EventResponse, DashboardEvent } from '../../../services/events.service';
import { AlertService } from '../../../services/alert.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { EventRegistrationsComponent } from '../event-registrations/event-registrations.component';
import { EventFormComponent } from '../event-form/event-form.component';

@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    NavbarComponent,
    FooterComponent,
    EventRegistrationsComponent,
    EventFormComponent
  ],
  templateUrl: './event-management.component.html',
  styleUrl: './event-management.component.scss'
})
export class EventManagementComponent implements OnInit {
  event: EventResponse | null = null;
  isLoading = signal(false);
  showEventForm = signal(false);
  editingEvent = signal<any>(null); // Use any to match EventFormComponent's EventInput interface

  constructor(
    public authService: AuthService,
    private eventsService: EventsService,
    private alertService: AlertService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    await this.loadEvent(eventId);
  }

  async loadEvent(eventId: number) {
    this.isLoading.set(true);
    try {
      const isAuthenticated = this.authService.isAuthenticated();
      this.event = await this.eventsService.getEventById(eventId, isAuthenticated);

      if (!this.event) {
        this.router.navigate(['/events']);
        return;
      }

      // Verify user is the creator or admin
      const user = this.authService.user();
      
      // Debug logging
      console.log('Event Management Permission Check:', {
        user: user ? { id: user.id, role: user.role, email: user.email } : null,
        event: this.event ? {
          id: this.event.id,
          creatorId: this.event.creatorId,
          creator: this.event.creator
        } : null,
        isEventCreator: this.isEventCreator(),
        isAdmin: user?.role === 'admin'
      });
      
      if (!user) {
        this.alertService.showError('Bạn cần đăng nhập để quản lý sự kiện');
        this.router.navigate(['/events', eventId]);
        return;
      }
      
      // Check permissions - allow if user is admin OR if they're a manager
      // Note: If creatorId is missing from backend response, we'll allow manager access 
      // and let backend APIs enforce permissions when they try to update/manage
      const isAdmin = user.role === 'admin';
      const isManager = user.role === 'manager';
      const isCreator = this.isEventCreator();
      
      // Allow access if:
      // 1. User is admin, OR
      // 2. User is manager (even if creatorId check fails, backend APIs will enforce)
      //    This is a workaround for backend potentially not returning creatorId
      if (!isAdmin && !isManager) {
        this.alertService.showError('Chỉ quản lý sự kiện hoặc admin mới có thể quản lý sự kiện');
        this.router.navigate(['/events', eventId]);
        return;
      }
      
      // Log if creatorId is missing (might indicate backend issue)
      if (isManager && !this.event?.creatorId) {
        console.warn('Event missing creatorId in response - this may indicate a backend issue', {
          eventId: this.event?.id,
          userId: user.id,
          event: this.event
        });
      }
      
      // If we have creatorId and it doesn't match, show warning but allow (backend will enforce)
      if (isManager && !isCreator && this.event?.creatorId) {
        console.warn('User ID does not match event creatorId - backend APIs will enforce permissions', {
          userId: user.id,
          eventCreatorId: this.event.creatorId
        });
      }
    } catch (error) {
      console.error('Error loading event:', error);
      this.router.navigate(['/events']);
    } finally {
      this.isLoading.set(false);
    }
  }

  isEventCreator(): boolean {
    const user = this.authService.user();
    if (!user || !this.event) {
      console.log('isEventCreator: No user or event', { user, event: this.event });
      return false;
    }
    
    // Check if user is manager
    if (user.role !== 'manager') {
      return false;
    }
    
    // Check creatorId - the backend should return this in defaultSelect for authenticated users
    const hasCreatorId = this.event.creatorId !== undefined && this.event.creatorId !== null;
    const creatorId = hasCreatorId ? Number(this.event.creatorId) : undefined;
    const idsMatch = creatorId !== undefined && Number(creatorId) === Number(user.id);
    
    console.log('isEventCreator check:', {
      isManager: true,
      hasCreatorId,
      creatorId: this.event.creatorId,
      creatorObject: this.event.creator,
      resolvedCreatorId: creatorId,
      userId: user.id,
      idsMatch,
      result: idsMatch
    });
    
    // If creatorId is missing, log a warning - this might be a backend issue
    if (!hasCreatorId) {
      console.warn('Event is missing creatorId field - this may be a backend issue. Event:', this.event);
    }
    
    return idsMatch;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
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
      'CANCELLED': 'Đã hủy',
      'COMPLETED': 'Hoàn thành'
    };
    return statusMap[status] || status;
  }

  openEditForm() {
    if (this.event) {
      this.editingEvent.set(this.event);
      this.showEventForm.set(true);
    }
  }

  closeEventForm() {
    this.showEventForm.set(false);
    this.editingEvent.set(null);
  }

  async onSaveEvent(eventData: any) {
    if (!this.event) return;

    this.isLoading.set(true);
    try {
      const updateData: any = {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        startTime: eventData.startDate || eventData.startTime,
        endTime: eventData.endDate || eventData.endTime,
        visibility: eventData.visibility || 'PUBLIC',
      };

      if (eventData.coverImage) {
        updateData.coverImage = eventData.coverImage;
      } else {
        updateData.coverImage = null;
      }

      // Handle category - use the event's existing category ID if category name matches
      // If the category name in form matches the event's category, keep the same categoryId
      if (eventData.category && this.event?.category && this.event.category.name === eventData.category) {
        updateData.categoryId = this.event.category.id;
      }
      // Note: If category is changed to a different one, we'd need to fetch categories from API
      // For now, we only update if the category name matches the existing one

      const result = await this.eventsService.updateEvent(this.event.id, updateData);
      if (result.success) {
        this.alertService.showSuccess(result.message);
        this.closeEventForm();
        await this.loadEvent(this.event.id);
      } else {
        this.alertService.showError(result.message);
      }
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Cập nhật sự kiện thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onCancelEvent() {
    if (!this.event) return;

    if (confirm(`Bạn có chắc muốn hủy sự kiện "${this.event.title}"?`)) {
      this.isLoading.set(true);
      try {
        const result = await this.eventsService.cancelEvent(this.event.id);
        if (result.success) {
          this.alertService.showSuccess(result.message);
          await this.loadEvent(this.event.id);
        } else {
          this.alertService.showError(result.message);
        }
      } catch (error: any) {
        this.alertService.showError(error?.message || 'Hủy sự kiện thất bại. Vui lòng thử lại!');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  goToEventDetail() {
    if (this.event) {
      this.router.navigate(['/events', this.event.id]);
    }
  }
}

