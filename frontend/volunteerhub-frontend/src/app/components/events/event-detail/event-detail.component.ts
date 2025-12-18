import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { EventsService, EventResponse } from '../../../services/events.service';
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
  canCancel = false;
  showLoginPrompt = false;
  isLoading = signal(false);

  constructor(
    public authService: AuthService,
    private eventsService: EventsService,
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

      // Check user's registration status
      if (isAuthenticated) {
        await this.checkRegistrationStatus(eventId);
      }
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
        this.registrationStatus = result.registration?.status || 'APPROVED';
        this.canCancel = true;
      }
      alert(result.message);
    } catch (error: any) {
      alert(error?.message || 'Đăng ký thất bại. Vui lòng thử lại!');
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
      }
      alert(result.message);
    } catch (error: any) {
      alert(error?.message || 'Hủy đăng ký thất bại. Vui lòng thử lại!');
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
    // Managers and Admins can manage wall
    return user.role === 'manager' || user.role === 'admin';
  }

  canManageRegistrations(): boolean {
    const user = this.authService.user();
    if (!user || !this.event) return false;
    // Event creator can manage registrations, Admins can manage all
    return (user.role === 'manager' && this.event.creatorId === user.id) || user.role === 'admin';
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

