import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService, UserProfile } from './auth-api.service';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'volunteer' | 'manager' | 'admin' | 'guest';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'volunteer' | 'manager';
}

/**
 * Helper function to convert backend role to frontend role
 */
function mapRole(backendRole: 'VOLUNTEER' | 'MANAGER' | 'ADMIN'): 'volunteer' | 'manager' | 'admin' {
  const roleMap: Record<'VOLUNTEER' | 'MANAGER' | 'ADMIN', 'volunteer' | 'manager' | 'admin'> = {
    VOLUNTEER: 'volunteer',
    MANAGER: 'manager',
    ADMIN: 'admin'
  };
  return roleMap[backendRole] || 'volunteer';
}

/**
 * Helper function to convert UserProfile to User
 */
function mapUserProfile(profile: UserProfile): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.fullName || profile.email.split('@')[0],
    role: mapRole(profile.role),
    avatar: profile.avatarUrl || undefined
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  public readonly user = this.currentUser.asReadonly();

  constructor(
    private router: Router,
    private authApi: AuthApiService
  ) {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        // Invalid stored user, clear it
        localStorage.removeItem('currentUser');
      }
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const response = await firstValueFrom(
        this.authApi.login({
          email: credentials.email,
          password: credentials.password
        })
      );

      const user = mapUserProfile(response.user);
      this.currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return { success: true, message: 'Đăng nhập thành công!', user };
    } catch (error: any) {
      const message = error?.message || 'Email hoặc mật khẩu không đúng!';
      return { success: false, message };
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{ success: boolean; message: string; user?: User }> {
    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      return { success: false, message: 'Mật khẩu xác nhận không khớp!' };
    }

    try {
      const response = await firstValueFrom(
        this.authApi.register({
          email: data.email,
          password: data.password,
          fullName: data.name
        })
      );

      const user = mapUserProfile(response);
      this.currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return { success: true, message: 'Đăng ký thành công!', user };
    } catch (error: any) {
      const message = error?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      return { success: false, message };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout API if user is authenticated
      if (this.isAuthenticated()) {
        await firstValueFrom(this.authApi.logout());
      }
    } catch (error) {
      // Even if API call fails, clear local state
      console.error('Logout API error:', error);
    } finally {
      // Clear local state regardless of API call result
      this.currentUser.set(null);
      localStorage.removeItem('currentUser');
      this.router.navigate(['/']);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      await firstValueFrom(this.authApi.refreshToken());
      return true;
    } catch (error) {
      // Refresh failed, user needs to login again
      this.currentUser.set(null);
      localStorage.removeItem('currentUser');
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: 'volunteer' | 'manager' | 'admin'): boolean {
    return this.currentUser()?.role === role;
  }

  isGuest(): boolean {
    return !this.isAuthenticated();
  }

  // Note: These methods are kept for backward compatibility but should be moved to a separate UsersService
  // when implementing user management APIs
  getAllUsers(): User[] {
    // TODO: Implement API call when users API is available
    return [];
  }

  toggleUserActive(userId: number): { success: boolean; message: string } {
    // TODO: Implement API call when users API is available
    return { success: false, message: 'Chức năng này chưa được triển khai' };
  }

  changeUserRole(userId: number, newRole: 'volunteer' | 'manager' | 'admin'): { success: boolean; message: string } {
    // TODO: Implement API call when users API is available
    return { success: false, message: 'Chức năng này chưa được triển khai' };
  }
}

