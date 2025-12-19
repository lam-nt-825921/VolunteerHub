import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { AuthService, RegisterData } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  registerData: RegisterData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'volunteer'
  };
  fieldErrors: { [key: string]: string } = {};
  errorMessage = ''; // For API errors
  successMessage = '';
  isLoading = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check for query parameters from landing page
    this.route.queryParams.subscribe(params => {
      if (params['name']) {
        this.registerData.name = params['name'];
      }
      if (params['email']) {
        this.registerData.email = params['email'];
      }
    });
  }

  async onRegister() {
    // Clear previous errors
    this.fieldErrors = {};
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.authService.register(this.registerData);
      
      if (result.success) {
        this.successMessage = result.message;
        setTimeout(() => {
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

  validateForm(): boolean {
    this.fieldErrors = {};
    let isValid = true;

    if (!this.registerData.name?.trim()) {
      this.fieldErrors['name'] = 'Vui lòng nhập họ và tên!';
      isValid = false;
    }

    if (!this.registerData.email?.trim()) {
      this.fieldErrors['email'] = 'Vui lòng nhập email!';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerData.email)) {
      this.fieldErrors['email'] = 'Email không hợp lệ!';
      isValid = false;
    }

    if (!this.registerData.password) {
      this.fieldErrors['password'] = 'Vui lòng nhập mật khẩu!';
      isValid = false;
    } else if (this.registerData.password.length < 6) {
      this.fieldErrors['password'] = 'Mật khẩu phải có ít nhất 6 ký tự!';
      isValid = false;
    }

    if (!this.registerData.confirmPassword) {
      this.fieldErrors['confirmPassword'] = 'Vui lòng xác nhận mật khẩu!';
      isValid = false;
    } else if (this.registerData.password !== this.registerData.confirmPassword) {
      this.fieldErrors['confirmPassword'] = 'Mật khẩu xác nhận không khớp!';
      isValid = false;
    }

    return isValid;
  }

  clearFieldError(fieldName: string) {
    if (this.fieldErrors[fieldName]) {
      delete this.fieldErrors[fieldName];
    }
  }

  switchToLogin() {
    this.router.navigate(['/login']);
  }
}

