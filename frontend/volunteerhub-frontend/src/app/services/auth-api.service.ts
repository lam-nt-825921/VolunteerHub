import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { API_CONFIG } from './api.config';

/**
 * Authentication API Response Interfaces
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: UserProfile;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string | null;
  role: 'VOLUNTEER' | 'EVENT_MANAGER' | 'ADMIN';
  isActive: boolean;
  createdAt?: string;
  avatarUrl?: string | null;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface LogoutResponse {
  message: string;
}

/**
 * Auth API Service
 * Handles all authentication-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  constructor(private apiService: ApiService) {}

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Observable<UserProfile> {
    return this.apiService.post<UserProfile>(
      API_CONFIG.endpoints.auth.register,
      data,
      false // No auth required for registration
    );
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(
      API_CONFIG.endpoints.auth.login,
      credentials,
      false // No auth required for login
    ).pipe(
      map((response) => {
        // Store access token
        if (response.accessToken) {
          this.apiService.setAccessToken(response.accessToken);
        }
        return response;
      })
    );
  }

  /**
   * Refresh access token
   * Uses httpOnly cookie for refresh token
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    return this.apiService.post<RefreshTokenResponse>(
      API_CONFIG.endpoints.auth.refresh,
      {},
      false // Refresh endpoint handles auth via cookie
    ).pipe(
      map((response) => {
        // Store new access token
        if (response.accessToken) {
          this.apiService.setAccessToken(response.accessToken);
        }
        return response;
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<LogoutResponse> {
    return this.apiService.post<LogoutResponse>(
      API_CONFIG.endpoints.auth.logout,
      {},
      true // Requires authentication
    ).pipe(
      map((response) => {
        // Clear access token on logout
        this.apiService.removeAccessToken();
        return response;
      })
    );
  }
}

