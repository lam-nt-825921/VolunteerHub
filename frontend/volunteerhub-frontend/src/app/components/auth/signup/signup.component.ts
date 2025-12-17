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
  errorMessage = '';
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
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // Validation
    if (!this.registerData.name || !this.registerData.email) {
      this.errorMessage = 'Vui lòng nhập đầy đủ họ tên và email!';
      this.isLoading = false;
      return;
    }

    if (!this.registerData.password || !this.registerData.confirmPassword) {
      this.errorMessage = 'Vui lòng nhập mật khẩu và xác nhận mật khẩu!';
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

  switchToLogin() {
    this.router.navigate(['/login']);
  }
}

