import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { EventsService, Event } from '../../../services/events.service';
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
  allEvents: Event[] = [];
  filteredEvents: Event[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedLocation = '';
  categories: string[] = [];
  locations: string[] = [];
  currentPage = 1;
  itemsPerPage = 9;

  constructor(
    public authService: AuthService,
    private eventsService: EventsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get approved events for guests, all for authenticated users
    if (this.authService.isAuthenticated() && this.authService.hasRole('admin')) {
      this.allEvents = this.eventsService.getAllEvents();
    } else {
      this.allEvents = this.eventsService.getApprovedEvents();
    }

    // Extract unique categories and locations
    this.categories = [...new Set(this.allEvents.map(e => e.category))];
    this.locations = [...new Set(this.allEvents.map(e => e.location))];

    this.filteredEvents = this.allEvents;
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
      filtered = filtered.filter(e => e.category === this.selectedCategory);
    }

    // Location filter
    if (this.selectedLocation) {
      filtered = filtered.filter(e => e.location === this.selectedLocation);
    }

    this.filteredEvents = filtered;
    this.currentPage = 1;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedLocation = '';
    this.filteredEvents = this.allEvents;
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

  get paginatedEvents(): Event[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEvents.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEvents.length / this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

