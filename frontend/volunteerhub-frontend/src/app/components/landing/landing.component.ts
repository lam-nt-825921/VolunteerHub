import { Component, signal } from '@angular/core';
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
export class LandingComponent {
  showLoginModal = signal(false);
  initialName = signal('');
  initialEmail = signal('');

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

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

