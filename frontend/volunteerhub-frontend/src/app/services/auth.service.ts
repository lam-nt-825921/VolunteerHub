import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService, UserProfile } from './auth-api.service';
import { AdminApiService, FilterUsersRequest } from './admin-api.service';
import { UserProfileResponse } from './users-api.service';

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
function mapRole(backendRole: 'VOLUNTEER' | 'EVENT_MANAGER' | 'ADMIN'): 'volunteer' | 'manager' | 'admin' {
  const roleMap: Record<'VOLUNTEER' | 'EVENT_MANAGER' | 'ADMIN', 'volunteer' | 'manager' | 'admin'> = {
    VOLUNTEER: 'volunteer',
    EVENT_MANAGER: 'manager',
    ADMIN: 'admin'
  };
  return roleMap[backendRole] || 'volunteer';
}

/**
 * Helper function to convert UserProfile or UserProfileResponse to User
 */
function mapUserProfile(profile: UserProfile | UserProfileResponse): User {
  const avatar = 'avatarUrl' in profile 
    ? (profile as UserProfile).avatarUrl 
    : (profile as UserProfileResponse).avatar;
  
  return {
    id: profile.id,
    email: profile.email,
    name: profile.fullName || profile.email.split('@')[0],
    role: mapRole(profile.role),
    avatar: avatar || undefined
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
    private authApi: AuthApiService,
    private adminApi: AdminApiService
  ) {
    // Initialize and validate session on app start
    // Use setTimeout to avoid calling async in constructor
    setTimeout(() => this.initializeSession(), 0);
  }

  /**
   * Initialize and validate user session on app start
   */
  private async initializeSession() {
    const storedUser = localStorage.getItem('currentUser');
    const accessToken = localStorage.getItem('accessToken');

    // If no user stored, nothing to restore
    if (!storedUser) {
      // Make sure access token is also cleared if no user
      if (accessToken) {
        localStorage.removeItem('accessToken');
      }
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      
      // If we have a user but no access token, try to refresh
      if (!accessToken) {
        const refreshSuccess = await this.refreshToken();
        if (!refreshSuccess) {
          // Refresh failed, clear session
          this.clearSession();
          return;
        }
      }

      // Restore user if we have valid token (either existing or refreshed)
      const currentToken = localStorage.getItem('accessToken');
      if (currentToken) {
        this.currentUser.set(user);
      } else {
        // No token available, clear session
        this.clearSession();
      }
    } catch (e) {
      // Invalid stored user, clear it
      this.clearSession();
    }
  }


  /**
   * Clear all session data
   */
  private clearSession() {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
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
      // Access token is already stored by AuthApiService.login()

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
      // Note: Registration doesn't return a token, so we don't set the user as logged in
      // User needs to login after registration to get a token
      // We'll return the user info but not set it as current user
      
      return { success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.', user };
    } catch (error: any) {
      const message = error?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      return { success: false, message };
    }
  }

  /**
   * Logout user
   * Always clears local state first, then attempts API call (which may fail if token expired)
   */
  async logout(): Promise<void> {
    // Check if we have a token BEFORE clearing (for API call)
    const hadToken = !!localStorage.getItem('accessToken');
    
    // ALWAYS clear local state first - this ensures logout always works
    // even if the token is expired and API call fails
    this.clearSession();
    
    // Try to call logout API, but don't wait for it or fail if it errors
    // The token might be expired, so the API call might fail
    if (hadToken) {
      try {
        await firstValueFrom(this.authApi.logout());
      } catch (error: any) {
        // If logout API fails (e.g., token expired), that's okay - we've already cleared local state
      }
    }
    
    // Navigate to home
    this.router.navigate(['/']);
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      await firstValueFrom(this.authApi.refreshToken());
      const newToken = localStorage.getItem('accessToken');
      return !!newToken;
    } catch (error: any) {
      // Refresh failed, user needs to login again
      this.clearSession();
      return false;
    }
  }

  isAuthenticated(): boolean {
    // User must exist AND have a valid access token
    const hasUser = this.currentUser() !== null;
    const hasToken = !!localStorage.getItem('accessToken');
    return hasUser && hasToken;
  }

  hasRole(role: 'volunteer' | 'manager' | 'admin'): boolean {
    return this.currentUser()?.role === role;
  }

  isGuest(): boolean {
    return !this.isAuthenticated();
  }

  /**
   * Debug method: Get detailed authentication state
   * Can be called from browser console: authService.getDebugInfo()
   */
  getDebugInfo() {
    const user = this.currentUser();
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('currentUser');
    
    let tokenExpiry: string | null = null;
    if (token) {
      try {
        // JWT tokens have 3 parts separated by dots
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.exp) {
            const expiryDate = new Date(payload.exp * 1000);
            const now = new Date();
            const timeLeft = expiryDate.getTime() - now.getTime();
            const minutesLeft = Math.floor(timeLeft / 60000);
            tokenExpiry = `${expiryDate.toLocaleString()} (${minutesLeft} minutes left)`;
          }
        }
      } catch (e) {
        tokenExpiry = 'Could not parse token';
      }
    }

    const debugInfo = {
      user: user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null,
      hasUser: !!user,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 30)}...` : null,
      tokenExpiry: tokenExpiry,
      isAuthenticated: this.isAuthenticated(),
      storedUserRaw: storedUser,
      localStorage: {
        currentUser: localStorage.getItem('currentUser'),
        accessToken: localStorage.getItem('accessToken') ? 'exists' : null
      }
    };
    
    return debugInfo;
  }

  // Admin methods - User Management
  async getAllUsers(filter?: FilterUsersRequest): Promise<User[]> {
    try {
      const response = await firstValueFrom(this.adminApi.getUsers(filter));
      return response.data.map(profile => mapUserProfile(profile));
    } catch (error: any) {
      return [];
    }
  }

  async toggleUserActive(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Get current user to check if active
      const user = await firstValueFrom(this.adminApi.getUserById(userId));
      const newActiveStatus = !user.isActive;
      
      await firstValueFrom(this.adminApi.toggleUserActive(userId, newActiveStatus));
      return { 
        success: true, 
        message: newActiveStatus ? 'Đã kích hoạt tài khoản!' : 'Đã vô hiệu hóa tài khoản!' 
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Cập nhật trạng thái thất bại. Vui lòng thử lại!' };
    }
  }

  async changeUserRole(userId: number, newRole: 'volunteer' | 'manager' | 'admin'): Promise<{ success: boolean; message: string }> {
    try {
      // Map frontend role to backend role
      const roleMap: Record<'volunteer' | 'manager' | 'admin', 'VOLUNTEER' | 'EVENT_MANAGER' | 'ADMIN'> = {
        volunteer: 'VOLUNTEER',
        manager: 'EVENT_MANAGER',
        admin: 'ADMIN'
      };
      
      await firstValueFrom(this.adminApi.changeUserRole(userId, roleMap[newRole]));
      return { success: true, message: `Đã thay đổi vai trò thành ${newRole}!` };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Thay đổi vai trò thất bại. Vui lòng thử lại!' };
    }
  }
}

