import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { EventsService, Event } from '../../../services/events.service';
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
  event: Event | undefined;
  isRegistered = false;
  registrationStatus: 'pending' | 'approved' | 'rejected' | 'completed' | null = null;
  canCancel = false;
  showLoginPrompt = false;

  constructor(
    public authService: AuthService,
    private eventsService: EventsService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.event = this.eventsService.getEventById(eventId);

    if (!this.event) {
      this.router.navigate(['/events']);
      return;
    }

    if (this.authService.isAuthenticated()) {
      const userId = this.authService.user()?.id;
      if (userId) {
        const registrations = this.eventsService.getUserRegistrations(userId);
        const registration = registrations.find(r => r.eventId === eventId);
        if (registration) {
          this.isRegistered = true;
          this.registrationStatus = registration.status as 'pending' | 'approved' | 'rejected' | 'completed' | null;
          // Can cancel only if event hasn't started
          this.canCancel = new Date(this.event.startDate) > new Date();
        }
      }
    }
  }

  onRegister() {
    if (!this.authService.isAuthenticated()) {
      this.showLoginPrompt = true;
      return;
    }

    if (!this.event) return;

    const userId = this.authService.user()?.id;
    if (userId) {
      const result = this.eventsService.registerForEvent(this.event.id, userId);
      if (result.success) {
        this.isRegistered = true;
        this.registrationStatus = 'pending';
        alert(result.message);
      } else {
        alert(result.message);
      }
    }
  }

  onCancelRegistration() {
    if (!this.event) return;

    const userId = this.authService.user()?.id;
    if (userId) {
      const result = this.eventsService.cancelRegistration(this.event.id, userId);
      if (result.success) {
        this.isRegistered = false;
        this.registrationStatus = null;
        alert(result.message);
      } else {
        alert(result.message);
      }
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
    // Managers can manage registrations for their own events, Admins can manage all
    return (user.role === 'manager' && this.event.managerId === user.id) || user.role === 'admin';
  }
}

