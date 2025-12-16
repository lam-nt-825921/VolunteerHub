import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, User } from '../../../services/auth.service';
import { EventsService, Event } from '../../../services/events.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, NavbarComponent, FooterComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  allEvents: Event[] = [];
  pendingEvents: Event[] = [];
  approvedEvents: Event[] = [];
  totalEvents = 0;
  totalUsers = 0;
  allUsers: User[] = [];
  showUsersTab = signal(false);
  editingUserRole = signal<{ userId: number; newRole: 'volunteer' | 'manager' | 'admin' } | null>(null);

  constructor(
    public authService: AuthService,
    private eventsService: EventsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEvents();
    this.loadUsers();
  }

  loadEvents() {
    this.allEvents = this.eventsService.getAllEvents();
    this.pendingEvents = this.eventsService.getPendingEvents();
    this.approvedEvents = this.allEvents.filter(e => e.status === 'approved');
    this.totalEvents = this.allEvents.length;
  }

  loadUsers() {
    this.allUsers = this.authService.getAllUsers();
    this.totalUsers = this.allUsers.length;
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

  approveEvent(event: Event) {
    const user = this.authService.user();
    if (!user) return;

    const result = this.eventsService.approveEvent(event.id, user.id);
    alert(result.message);
    if (result.success) {
      this.loadEvents();
    }
  }

  rejectEvent(event: Event) {
    if (confirm(`Bạn có chắc muốn từ chối sự kiện "${event.title}"?`)) {
      const result = this.eventsService.rejectEvent(event.id);
      alert(result.message);
      if (result.success) {
        this.loadEvents();
      }
    }
  }

  deleteEvent(event: Event) {
    if (confirm(`Bạn có chắc muốn xóa sự kiện "${event.title}"?`)) {
      const result = this.eventsService.adminDeleteEvent(event.id);
      alert(result.message);
      if (result.success) {
        this.loadEvents();
      }
    }
  }

  toggleUsersTab() {
    this.showUsersTab.update(v => !v);
  }

  toggleUserActive(user: User) {
    const result = this.authService.toggleUserActive(user.id);
    alert(result.message);
    if (result.success) {
      this.loadUsers();
    }
  }

  changeUserRole(user: User, newRole: 'volunteer' | 'manager' | 'admin') {
    if (confirm(`Bạn có chắc muốn thay đổi vai trò của ${user.name} thành ${newRole}?`)) {
      const result = this.authService.changeUserRole(user.id, newRole);
      alert(result.message);
      if (result.success) {
        this.loadUsers();
      }
    }
  }

  exportEvents() {
    const csv = this.eventsService.exportEventsToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `events_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

