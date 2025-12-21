import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { EventsService, EventResponse } from '../../../services/events.service';
import { AlertService } from '../../../services/alert.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { EventWallComponent } from '../event-wall/event-wall.component';
import { EventRegistrationsComponent } from '../event-registrations/event-registrations.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, NavbarComponent, FooterComponent, EventWallComponent, EventRegistrationsComponent],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss'
})
export class EventDetailComponent implements OnInit {
  event: EventResponse | null = null;
  isRegistered = false;
  registrationStatus: string | null = null;
  registrationPermissions: number | null = null;
  canCancel = false;
  showLoginPrompt = false;
  isLoading = signal(false);

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
    
    // Check if there's a commentId in query params (from notification click)
    const commentId = this.route.snapshot.queryParamMap.get('commentId');
    if (commentId) {
      // Wait for the wall component to load posts and comments, then scroll to comment
      // Try multiple times with increasing delays to ensure comment is loaded
      this.scrollToCommentWithRetry(Number(commentId), 0);
    }
  }

  /**
   * Scroll to a specific comment with retry logic
   */
  private scrollToCommentWithRetry(commentId: number, attempt: number): void {
    const maxAttempts = 5;
    const delay = 500 * (attempt + 1); // 500ms, 1000ms, 1500ms, 2000ms, 2500ms
    
    setTimeout(() => {
      const element = document.getElementById(`comment-${commentId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the comment briefly
        element.classList.add('highlight-comment');
        setTimeout(() => {
          element.classList.remove('highlight-comment');
        }, 2000);
      } else if (attempt < maxAttempts) {
        // Retry if element not found yet
        this.scrollToCommentWithRetry(commentId, attempt + 1);
      }
    }, delay);
  }

  async loadEvent(eventId: number) {
    this.isLoading.set(true);
    try {
      const isAuthenticated = this.authService.isAuthenticated();
      
      // Load event and registration status in parallel for better UX
      const [event] = await Promise.all([
        this.eventsService.getEventById(eventId, isAuthenticated),
        // Check registration status in parallel (don't block event loading)
        isAuthenticated ? this.checkRegistrationStatus(eventId).catch(err => {
          console.error('Error checking registration:', err);
          // Don't throw - allow event to load even if registration check fails
        }) : Promise.resolve()
      ]);

      if (!event) {
        this.router.navigate(['/events']);
        return;
      }

      this.event = event;
    } catch (error) {
      console.error('Error loading event:', error);
      this.router.navigate(['/events']);
    } finally {
      this.isLoading.set(false);
    }
  }

  async checkRegistrationStatus(eventId: number) {
    try {
      // Get user's participation history and check if they're registered for this event
      const history = await this.eventsService.getParticipationHistory();
      const registration = history.find(h => h.event.id === eventId);
      
      if (registration) {
        this.isRegistered = true;
        this.registrationStatus = registration.status;
        this.registrationPermissions = registration.permissions;
        // Can cancel only if event hasn't started and not already left/kicked
        this.canCancel = this.event?.startTime 
          ? new Date(this.event.startTime) > new Date() && 
            !['LEFT', 'KICKED', 'REJECTED'].includes(registration.status)
          : false;
      }
    } catch (error) {
      // User might not have access to their history, or no registrations
      console.error('Error checking registration:', error);
    }
  }

  async onRegister() {
    if (!this.authService.isAuthenticated()) {
      this.showLoginPrompt = true;
      return;
    }

    if (!this.event) return;

    this.isLoading.set(true);
    try {
      const result = await this.eventsService.registerForEvent(this.event.id);
      if (result.success) {
        this.isRegistered = true;
        this.registrationStatus = result.registration?.status || 'PENDING';
        this.canCancel = true;
        this.alertService.showSuccess(result.message);
      } else {
        this.alertService.showError(result.message);
      }
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onCancelRegistration() {
    if (!this.event) return;

    this.isLoading.set(true);
    try {
      const result = await this.eventsService.leaveEvent(this.event.id);
      if (result.success) {
        this.isRegistered = false;
        this.registrationStatus = null;
        this.canCancel = false;
        this.alertService.showSuccess(result.message);
      } else {
        this.alertService.showError(result.message);
      }
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Hủy đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
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

  goToLogin() {
    this.router.navigate(['/']);
  }

  canManageWall(): boolean {
    const user = this.authService.user();
    if (!user) return false;
    
    // Admins can always manage
    if (user.role === 'admin') return true;
    
    // Event creator can always manage
    if (this.event && user.id === this.event.creatorId) return true;
    
    // Check POST_APPROVE permission (value = 4) from registration
    if (this.registrationPermissions !== null && this.registrationPermissions !== undefined) {
      // POST_APPROVE = 4 (1 << 2)
      const POST_APPROVE = 4;
      return (this.registrationPermissions & POST_APPROVE) === POST_APPROVE;
    }
    
    // Fallback: Managers can manage wall (for backwards compatibility)
    return user.role === 'manager';
  }

  canAccessWall(): boolean {
    const user = this.authService.user();
    if (!user || !this.event) {
      return false;
    }
    
    // Managers and Admins can always access
    if (user.role === 'manager' || user.role === 'admin') {
      return true;
    }
    
    // For PUBLIC events, all authenticated users can access (even if not registered)
    if (this.event.visibility === 'PUBLIC') {
      return true;
    }
    
    // For INTERNAL/PRIVATE events, users need to be registered and approved
    if (this.event.visibility === 'INTERNAL' || this.event.visibility === 'PRIVATE') {
      const canAccess = this.isRegistered && (this.registrationStatus === 'APPROVED' || this.registrationStatus === 'ATTENDED');
      return canAccess;
    }
    
    return false;
  }

  canManageRegistrations(): boolean {
    const user = this.authService.user();
    if (!user || !this.event) {
      return false;
    }
    // Event creator (manager) can manage registrations for events they created
    // Admins can manage registrations for all events
    const isEventCreator = user.role === 'manager' && this.event.creatorId !== undefined && this.event.creatorId === user.id;
    const isAdmin = user.role === 'admin';
    return isEventCreator || isAdmin;
  }

  canViewRegistrations(): boolean {
    // Tất cả user tham gia sự kiện (APPROVED/ATTENDED) đều có thể xem danh sách
    // Backend sẽ tự filter: có quyền REGISTRATION_APPROVE thì xem tất cả, không có thì chỉ xem APPROVED/ATTENDED
    return this.isRegistered && (this.registrationStatus === 'APPROVED' || this.registrationStatus === 'ATTENDED');
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Từ chối',
      'CANCELLED': 'Đã hủy',
      'COMPLETED': 'Hoàn thành',
      'ATTENDED': 'Đã tham gia',
      'KICKED': 'Đã bị xóa',
      'LEFT': 'Đã rời'
    };
    return statusMap[status] || status;
  }
}

