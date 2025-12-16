import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { AuthService, LoginCredentials } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
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
      // Redirect to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = result.message;
    }
    
    this.isLoading = false;
  }
}

