import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { EventsService, DashboardEvent, DashboardStats, ParticipationHistoryItem } from '../../../services/events.service';
import { WallService, WallPost } from '../../../services/wall.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-volunteer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, NavbarComponent, FooterComponent],
  templateUrl: './volunteer-dashboard.component.html',
  styleUrl: './volunteer-dashboard.component.scss'
})
export class VolunteerDashboardComponent implements OnInit {
  upcomingEvents: DashboardEvent[] = [];
  joinedEvents: DashboardEvent[] = [];
  totalHours = 0;
  badges = 0;
  newEvents: DashboardEvent[] = [];
  trendingEvents: DashboardEvent[] = [];
  eventsWithNewPosts: DashboardEvent[] = [];
  stats: DashboardStats | null = null;
  isLoading = signal(false);

  constructor(
    public authService: AuthService,
    private eventsService: EventsService,
    private wallService: WallService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (this.authService.isAuthenticated()) {
      await this.loadDashboard();
    }
  }

  async loadDashboard() {
    this.isLoading.set(true);
    try {
      // Load dashboard stats
      this.stats = await this.eventsService.getDashboardStats();
      this.totalHours = this.stats.totalHoursVolunteered || 0;
      this.badges = Math.floor(this.totalHours / 10);

      // Load upcoming events
      this.upcomingEvents = await this.eventsService.getUpcomingEvents();

      // Load joined events
      this.joinedEvents = await this.eventsService.getMyEvents(undefined, 'joined');

      // Load recommended events as "new events"
      this.newEvents = await this.eventsService.getRecommendedEvents({ limit: 3 });

      // Load trending events (recommended with high registrations)
      const recommended = await this.eventsService.getRecommendedEvents({ limit: 10 });
      this.trendingEvents = recommended
        .filter(e => e.registrationsCount > 5)
        .slice(0, 3);

      // Events with new posts - use local wall service data
      this.loadEventsWithNewPosts();
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  loadEventsWithNewPosts() {
    // Events with recent posts (last 24 hours) - using local wall service
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    this.eventsWithNewPosts = this.joinedEvents.filter(e => {
      const posts = this.wallService.getPostsByEvent(e.id);
      return posts.some((p: WallPost) => new Date(p.createdAt) >= oneDayAgo);
    }).slice(0, 3);
  }

  viewAllEvents() {
    this.router.navigate(['/events']);
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
}

