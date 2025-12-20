import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, User } from '../../../services/auth.service';
import { EventsService, EventResponse } from '../../../services/events.service';
import { AdminApiService } from '../../../services/admin-api.service';
import { AlertService } from '../../../services/alert.service';
import { ConfirmationService } from '../../../services/confirmation.service';
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
  allEvents: EventResponse[] = [];
  pendingEvents: EventResponse[] = [];
  approvedEvents: EventResponse[] = [];
  totalEvents = 0;
  totalUsers = 0;
  allUsers: User[] = [];
  showUsersTab = signal(false);
  editingUserRole = signal<{ userId: number; newRole: 'volunteer' | 'manager' | 'admin' } | null>(null);

  isLoading = signal(false);
  errorMessage = signal('');

  // User list pagination and filtering
  userSearchKeyword = signal('');
  userRoleFilter = signal<'VOLUNTEER' | 'EVENT_MANAGER' | 'ADMIN' | ''>('');
  userStatusFilter = signal<'all' | 'active' | 'inactive'>('all');
  userSortField = signal<'id' | 'name' | 'email' | 'role' | 'createdAt'>('id');
  userSortDirection = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  paginatedUsers = signal<User[]>([]);

  constructor(
    public authService: AuthService,
    private eventsService: EventsService,
    private adminApi: AdminApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadEvents();
    await this.loadUsers();
  }

  async loadEvents() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      // Get all events for admin
      const allResult = await this.eventsService.getEvents({ limit: 100 });
      this.allEvents = allResult.data;
      this.totalEvents = allResult.meta.total;
      
      // Get pending events for approval
      const pendingResult = await this.eventsService.getPendingEvents({ limit: 50 });
      this.pendingEvents = pendingResult.data;
      
      // Filter approved events from all
      this.approvedEvents = this.allEvents.filter(e => e.status === 'APPROVED');
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Không thể tải danh sách sự kiện');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadUsers() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const filter: any = {
        page: this.currentPage(),
        limit: this.pageSize()
      };

      if (this.userSearchKeyword().trim()) {
        filter.keyword = this.userSearchKeyword().trim();
      }

      if (this.userRoleFilter()) {
        filter.role = this.userRoleFilter();
      }

      if (this.userStatusFilter() !== 'all') {
        filter.isActive = this.userStatusFilter() === 'active';
      }

      const response = await this.adminApi.getUsers(filter).toPromise();
      if (response) {
        this.allUsers = response.data.map(profile => this.mapUserProfile(profile));
        this.totalUsers = response.pagination.total;
        this.totalPages.set(response.pagination.totalPages);
        
        // Apply client-side sorting
        this.applySorting();
      }
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Không thể tải danh sách người dùng');
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapUserProfile(profile: any): User {
    const roleMap: Record<string, 'volunteer' | 'manager' | 'admin'> = {
      VOLUNTEER: 'volunteer',
      EVENT_MANAGER: 'manager',
      ADMIN: 'admin'
    };
    return {
      id: profile.id,
      email: profile.email,
      name: profile.fullName || profile.email.split('@')[0],
      role: roleMap[profile.role] || 'volunteer',
      avatar: profile.avatarUrl || undefined
    };
  }

  applySorting() {
    const users = [...this.allUsers];
    const field = this.userSortField();
    const direction = this.userSortDirection();

    users.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (field) {
        case 'id':
          aVal = a.id;
          bVal = b.id;
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'role':
          aVal = a.role;
          bVal = b.role;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.paginatedUsers.set(users);
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onRoleFilterChange() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onStatusFilterChange() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onSortChange(field: 'id' | 'name' | 'email' | 'role' | 'createdAt') {
    if (this.userSortField() === field) {
      // Toggle direction if same field
      this.userSortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.userSortField.set(field);
      this.userSortDirection.set('asc');
    }
    this.applySorting();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  isNumber(value: number | string): value is number {
    return typeof value === 'number';
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadUsers();
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadUsers();
    }
  }

  getPaginationPages(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 2) {
        // Near the end
        pages.push('...');
        for (let i = total - 3; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }

    return pages;
  }

  // Expose Math to template
  Math = Math;

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

  async approveEvent(event: EventResponse) {
    const confirmed = await this.confirmationService.confirm(
      `Bạn có chắc muốn duyệt sự kiện "${event.title}"?`,
      'Xác nhận duyệt sự kiện'
    );
    if (!confirmed) return;

    this.isLoading.set(true);
    try {
      const result = await this.eventsService.approveEvent(event.id);
      if (result.success) {
        await this.loadEvents();
        // No success alert - action is visible (event status changes)
      } else {
        this.alertService.showError(result.message);
      }
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Duyệt sự kiện thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async rejectEvent(event: EventResponse) {
    const confirmed = await this.confirmationService.confirm(
      `Bạn có chắc muốn từ chối sự kiện "${event.title}"?`,
      'Xác nhận từ chối sự kiện'
    );
    if (!confirmed) return;

    this.isLoading.set(true);
    try {
      const result = await this.eventsService.rejectEvent(event.id);
      if (result.success) {
        await this.loadEvents();
        // No success alert - action is visible (event status changes)
      } else {
        this.alertService.showError(result.message);
      }
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Từ chối sự kiện thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async cancelEvent(event: EventResponse) {
    const confirmed = await this.confirmationService.confirm(
      `Bạn có chắc muốn hủy sự kiện "${event.title}"?`,
      'Xác nhận hủy sự kiện'
    );
    if (!confirmed) return;

    this.isLoading.set(true);
    try {
      const result = await this.eventsService.cancelEvent(event.id);
      if (result.success) {
        await this.loadEvents();
        // No success alert - action is visible (event status changes)
      } else {
        this.alertService.showError(result.message);
      }
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Hủy sự kiện thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleUsersTab() {
    this.showUsersTab.update(v => !v);
  }

  async toggleUserActive(user: User) {
    this.isLoading.set(true);
    try {
      const result = await this.authService.toggleUserActive(user.id);
      if (result.success) {
        this.alertService.showSuccess(result.message);
        await this.loadUsers();
      } else {
        this.alertService.showError(result.message);
      }
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Cập nhật trạng thái thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async changeUserRole(user: User, newRole: 'volunteer' | 'manager' | 'admin') {
    const confirmed = await this.confirmationService.confirm(
      `Bạn có chắc muốn thay đổi vai trò của ${user.name} thành ${newRole}?`,
      'Xác nhận thay đổi vai trò'
    );
    if (!confirmed) return;

    this.isLoading.set(true);
    try {
      const result = await this.authService.changeUserRole(user.id, newRole);
      if (result.success) {
        await this.loadUsers();
        // No success alert - action is visible (role changes in table)
      } else {
        this.alertService.showError(result.message);
      }
    } catch (error: any) {
      this.alertService.showError(error?.message || 'Thay đổi vai trò thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  exportEvents() {
    // Export events to CSV
    const events = this.allEvents;
    const headers = ['ID', 'Tiêu đề', 'Mô tả', 'Địa điểm', 'Ngày bắt đầu', 'Ngày kết thúc', 'Trạng thái', 'Hiển thị', 'Số đăng ký'];
    const rows = events.map(e => [
      e.id.toString(),
      e.title,
      e.description.substring(0, 100),
      e.location,
      e.startTime,
      e.endTime,
      e.status,
      e.visibility,
      (e._count?.registrations || 0).toString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `events_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get status display text in Vietnamese
   */
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

  /**
   * Get status CSS class
   */
  getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      'PENDING': 'status-pending',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected',
      'CANCELLED': 'status-cancelled',
      'COMPLETED': 'status-completed'
    };
    return classMap[status] || '';
  }
}

