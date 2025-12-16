import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService, RegisterData } from '../../../services/auth.service';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent {
  @Output() registerSuccess = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();

  registerData: RegisterData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'volunteer'
  };
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // Validation
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin!';
      this.isLoading = false;
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự!';
      this.isLoading = false;
      return;
    }

    const result = this.authService.register(this.registerData);
    
    if (result.success) {
      this.successMessage = result.message;
      setTimeout(() => {
        this.registerSuccess.emit();
        // Redirect to dashboard
        this.router.navigate(['/dashboard']);
      }, 1500);
    } else {
      this.errorMessage = result.message;
    }
    
    this.isLoading = false;
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }
}

