import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { EventsService, Event } from '../../../services/events.service';
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
  upcomingEvents: Event[] = [];
  joinedEvents: Event[] = [];
  totalHours = 0;
  badges = 0;
  newEvents: Event[] = [];
  trendingEvents: Event[] = [];
  eventsWithNewPosts: Event[] = [];

  constructor(
    public authService: AuthService,
    private eventsService: EventsService,
    private wallService: WallService,
    private router: Router
  ) {}

  ngOnInit() {
    const userId = this.authService.user()?.id;
    if (userId) {
      this.upcomingEvents = this.eventsService.getUserUpcomingEvents(userId);
      this.joinedEvents = this.eventsService.getUserJoinedEvents(userId);
      this.totalHours = this.eventsService.getTotalVolunteerHours(userId);
      // Mock badges count
      this.badges = Math.floor(this.totalHours / 10);
      
      // Load enhanced dashboard data
      this.loadNewEvents();
      this.loadTrendingEvents();
      this.loadEventsWithNewPosts();
    }
  }

  loadNewEvents() {
    // Events created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.newEvents = this.eventsService.getApprovedEvents()
      .filter(e => new Date(e.createdAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }

  loadTrendingEvents() {
    // Events with high participation and activity
    this.trendingEvents = this.eventsService.getApprovedEvents()
      .filter(e => {
        const participationRate = e.currentParticipants / e.maxParticipants;
        const hasPosts = this.wallService.getPostsByEvent(e.id).length > 0;
        return participationRate > 0.5 && hasPosts;
      })
      .sort((a, b) => {
        const aRate = a.currentParticipants / a.maxParticipants;
        const bRate = b.currentParticipants / b.maxParticipants;
        return bRate - aRate;
      })
      .slice(0, 3);
  }

  loadEventsWithNewPosts() {
    // Events with recent posts (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const allEvents = this.eventsService.getApprovedEvents();
    this.eventsWithNewPosts = allEvents.filter(e => {
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

