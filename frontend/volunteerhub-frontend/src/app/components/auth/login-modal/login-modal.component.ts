import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials } from '../../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.scss'
})
export class LoginModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  credentials: LoginCredentials = {
    email: '',
    password: ''
  };
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.errorMessage = '';
    this.isLoading = true;

    const result = this.authService.login(this.credentials);
    
    if (result.success) {
      this.loginSuccess.emit();
      this.close.emit();
      // Redirect to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = result.message;
    }
    
    this.isLoading = false;
  }

  onClose() {
    this.close.emit();
  }

  onSwitchToRegister() {
    this.switchToRegister.emit();
  }
}

