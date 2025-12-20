import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() goBack = new EventEmitter<void>();

  private _initialData: { name: string; email: string } | null = null;

  registerData: RegisterData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'volunteer' // Always volunteer, no selection
  };
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  @Input() set initialData(data: { name: string; email: string } | null) {
    this._initialData = data;
    if (data) {
      this.registerData.name = data.name;
      this.registerData.email = data.email;
    }
  }

  get initialData(): { name: string; email: string } | null {
    return this._initialData;
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onRegister() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // Validation
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password || !this.registerData.confirmPassword) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin!';
      this.isLoading = false;
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự!';
      this.isLoading = false;
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp!';
      this.isLoading = false;
      return;
    }

    try {
      const result = await this.authService.register(this.registerData);
      
      if (result.success) {
        this.successMessage = result.message;
        setTimeout(() => {
          this.registerSuccess.emit();
          // Redirect to login page since registration doesn't auto-login
          this.router.navigate(['/login']);
        }, 1500);
      } else {
        this.errorMessage = result.message;
      }
    } catch (error: any) {
      this.errorMessage = error?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
    } finally {
      this.isLoading = false;
    }
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }
}

