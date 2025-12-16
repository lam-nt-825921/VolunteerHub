import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { LoginModalComponent } from '../auth/login-modal/login-modal.component';
import { RegisterFormComponent } from '../auth/register-form/register-form.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    NavbarComponent,
    FooterComponent,
    LoginModalComponent,
    RegisterFormComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  showRegisterForm = signal(false);
  showLoginModal = signal(false);

  constructor(public authService: AuthService) {}

  openRegisterForm() {
    this.showRegisterForm.set(true);
  }

  closeRegisterForm() {
    this.showRegisterForm.set(false);
  }

  openLoginModal() {
    this.showLoginModal.set(true);
  }

  closeLoginModal() {
    this.showLoginModal.set(false);
  }

  switchToLogin() {
    this.showRegisterForm.set(false);
    this.showLoginModal.set(true);
  }

  switchToRegister() {
    this.showLoginModal.set(false);
    this.showRegisterForm.set(true);
  }

  onRegisterSuccess() {
    this.closeRegisterForm();
  }

  onLoginSuccess() {
    this.closeLoginModal();
  }
}

