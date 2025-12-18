import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { EventsService, EventResponse } from '../../../services/events.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, NavbarComponent, FooterComponent],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss'
})
export class EventsListComponent implements OnInit {
  allEvents: EventResponse[] = [];
  filteredEvents: EventResponse[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedLocation = '';
  categories: string[] = [];
  locations: string[] = [];
  currentPage = 1;
  itemsPerPage = 9;
  isLoading = signal(false);
  totalPages = 0;
  totalItems = 0;

  constructor(
    public authService: AuthService,
    private eventsService: EventsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    await this.loadEvents();
  }

  async loadEvents() {
    this.isLoading.set(true);
    try {
      // Get events based on authentication status
      if (this.authService.isAuthenticated()) {
        // Authenticated users see all events they have access to
        const result = await this.eventsService.getEvents({ 
          page: 1, 
          limit: 100 
        });
        this.allEvents = result.data;
        this.totalItems = result.meta.total;
      } else {
        // Public users only see public approved events
        const result = await this.eventsService.getPublicEvents({ 
          page: 1, 
          limit: 100 
        });
        this.allEvents = result.data;
        this.totalItems = result.meta.total;
      }

      // Extract unique categories and locations
      this.categories = [...new Set(
        this.allEvents
          .filter(e => e.category?.name)
          .map(e => e.category!.name)
      )];
      this.locations = [...new Set(this.allEvents.map(e => e.location))];

      this.applyFilters();
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearch() {
    this.applyFilters();
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onLocationChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allEvents];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(e => e.category?.name === this.selectedCategory);
    }

    // Location filter
    if (this.selectedLocation) {
      filtered = filtered.filter(e => e.location === this.selectedLocation);
    }

    this.filteredEvents = filtered;
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedLocation = '';
    this.filteredEvents = this.allEvents;
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    this.currentPage = 1;
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

  get paginatedEvents(): EventResponse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEvents.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

