import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { LoginModalComponent } from '../auth/login-modal/login-modal.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    NavbarComponent,
    FooterComponent,
    LoginModalComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {
  showLoginModal = signal(false);
  initialName = signal('');
  initialEmail = signal('');
  
  // Image paths
  horizontalImages = [
    '/landing_page/common/h1.jpg',
    '/landing_page/common/h2.jpg',
    '/landing_page/common/h3.jpg',
    '/landing_page/common/h_cleaning.jpg',
    '/landing_page/common/h_cleaning2.jpg',
    '/landing_page/common/h_donation.jpg',
    '/landing_page/common/h_food.jpg',
    '/landing_page/common/h_food2.jpg',
    '/landing_page/common/h_planting.jpg'
  ];
  
  verticalImages = [
    '/landing_page/common/v_cleaning.jpg',
    '/landing_page/common/v_cleaning2.jpg',
    '/landing_page/common/v_donation.jpg',
    '/landing_page/common/v_food.jpg',
    '/landing_page/common/v_plant.jpg',
    '/landing_page/common/v_plant2.jpg'
  ];

  // Organized gallery items with mixed patterns: 3h+1v or 2v+1h
  galleryItems: Array<{ src: string; type: 'h' | 'v'; alt: string }> = [];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.organizeGalleryItems();
  }

  private organizeGalleryItems() {
    // Create mixed pattern arrangement: 3h+1v or 2v+1h in mixed order
    // Patterns alternate to create visual variety across the 3 columns
    
    const items: Array<{ src: string; type: 'h' | 'v'; alt: string }> = [];
    let hIndex = 0;
    let vIndex = 0;
    
    // Define patterns: 3h+1v (Pattern A) and 2v+1h (Pattern B)
    // Mix them to distribute across 3 columns
    const patterns = [
      // Pattern A: 3h + 1v (uses 3 horizontal, 1 vertical)
      { h: 3, v: 1 },
      // Pattern B: 2v + 1h (uses 2 vertical, 1 horizontal)
      { h: 1, v: 2 },
      // Pattern A again
      { h: 3, v: 1 },
      // Pattern B again
      { h: 1, v: 2 },
      // Remaining horizontal images (should be 2 left: 9 - 3 - 1 - 3 - 1 = 1, but we'll use what's left)
      { h: 2, v: 0 }
    ];
    
    for (const pattern of patterns) {
      // Add horizontal images for this pattern
      for (let i = 0; i < pattern.h && hIndex < this.horizontalImages.length; i++) {
        items.push({
          src: this.horizontalImages[hIndex],
          type: 'h',
          alt: `Khoảnh khắc tình nguyện ${hIndex + 1}`
        });
        hIndex++;
      }
      
      // Add vertical images for this pattern
      for (let i = 0; i < pattern.v && vIndex < this.verticalImages.length; i++) {
        items.push({
          src: this.verticalImages[vIndex],
          type: 'v',
          alt: `Khoảnh khắc tình nguyện ${vIndex + 1}`
        });
        vIndex++;
      }
    }
    
    // Add any remaining vertical images
    while (vIndex < this.verticalImages.length) {
      items.push({
        src: this.verticalImages[vIndex],
        type: 'v',
        alt: `Khoảnh khắc tình nguyện ${vIndex + 1}`
      });
      vIndex++;
    }
    
    this.galleryItems = items;
  }

  // Background image
  backgroundImage = '/landing_page/h_background.jpg';
  
  // Carousel states - separate for horizontal and vertical
  currentHorizontalCarouselIndex = signal(0);
  currentVerticalCarouselIndex = signal(0);
  horizontalCarouselDirection = signal<'left' | 'right'>('right');
  private horizontalCarouselInterval: any;
  private verticalCarouselInterval: any;

  ngOnInit() {
    // Auto-play carousels: change image every 5 seconds
    this.startHorizontalCarouselInterval();
    this.startVerticalCarouselInterval();
  }

  private startHorizontalCarouselInterval() {
    if (this.horizontalCarouselInterval) {
      clearInterval(this.horizontalCarouselInterval);
    }
    // Auto-play: advance without resetting the interval
    this.horizontalCarouselInterval = setInterval(() => {
      this.horizontalCarouselDirection.set('right');
      this.currentHorizontalCarouselIndex.update(idx => 
        (idx + 1) % this.horizontalImages.length
      );
    }, 5000);
  }

  private startVerticalCarouselInterval() {
    if (this.verticalCarouselInterval) {
      clearInterval(this.verticalCarouselInterval);
    }
    this.verticalCarouselInterval = setInterval(() => {
      this.nextVerticalCarouselImage();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.horizontalCarouselInterval) {
      clearInterval(this.horizontalCarouselInterval);
    }
    if (this.verticalCarouselInterval) {
      clearInterval(this.verticalCarouselInterval);
    }
  }

  // Horizontal carousel controls
  nextHorizontalCarouselImage() {
    this.resetHorizontalCarouselInterval();
    this.horizontalCarouselDirection.set('right');
    this.currentHorizontalCarouselIndex.update(idx => 
      (idx + 1) % this.horizontalImages.length
    );
  }

  previousHorizontalCarouselImage() {
    this.resetHorizontalCarouselInterval();
    this.horizontalCarouselDirection.set('left');
    this.currentHorizontalCarouselIndex.update(idx => 
      idx === 0 ? this.horizontalImages.length - 1 : idx - 1
    );
  }

  private resetHorizontalCarouselInterval() {
    // Clear and restart the auto-play interval
    this.startHorizontalCarouselInterval();
  }

  goToHorizontalCarouselImage(index: number) {
    this.resetHorizontalCarouselInterval();
    const current = this.currentHorizontalCarouselIndex();
    this.horizontalCarouselDirection.set(index > current ? 'right' : 'left');
    this.currentHorizontalCarouselIndex.set(index);
  }

  getPreviousHorizontalIndex(): number {
    const current = this.currentHorizontalCarouselIndex();
    return current === 0 ? this.horizontalImages.length - 1 : current - 1;
  }

  getNextHorizontalIndex(): number {
    const current = this.currentHorizontalCarouselIndex();
    return (current + 1) % this.horizontalImages.length;
  }

  // Vertical carousel controls
  nextVerticalCarouselImage() {
    this.currentVerticalCarouselIndex.update(idx => 
      (idx + 1) % this.verticalImages.length
    );
  }

  previousVerticalCarouselImage() {
    this.currentVerticalCarouselIndex.update(idx => 
      idx === 0 ? this.verticalImages.length - 1 : idx - 1
    );
  }

  goToVerticalCarouselImage(index: number) {
    this.currentVerticalCarouselIndex.set(index);
  }

  openLoginModal() {
    this.showLoginModal.set(true);
  }

  closeLoginModal() {
    this.showLoginModal.set(false);
  }

  onInitialInfoSubmit(data: { name: string; email: string }) {
    if (!data.name || !data.email) {
      return;
    }
    // Redirect to signup page with the data as query parameters
    this.router.navigate(['/signup'], {
      queryParams: {
        name: data.name,
        email: data.email
      }
    });
  }

  onLoginSuccess() {
    this.closeLoginModal();
  }
}

