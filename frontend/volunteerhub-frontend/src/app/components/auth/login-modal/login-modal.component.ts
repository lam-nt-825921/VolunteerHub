import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials } from '../../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
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

  async onLogin() {
    this.errorMessage = '';
    this.isLoading = true;

    try {
      const result = await this.authService.login(this.credentials);
      
      if (result.success) {
        this.loginSuccess.emit();
        this.close.emit();
        // Redirect to dashboard
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = result.message;
      }
    } catch (error: any) {
      this.errorMessage = error?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
    } finally {
      this.isLoading = false;
    }
  }

  onClose() {
    this.close.emit();
  }

  onSwitchToRegister() {
    this.switchToRegister.emit();
  }
}

