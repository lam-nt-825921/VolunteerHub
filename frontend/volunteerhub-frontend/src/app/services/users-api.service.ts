import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from './api.config';

/**
 * User Profile Response Interface
 */
export interface UserProfileResponse {
  id: number;
  email: string;
  fullName: string | null;
  role: 'VOLUNTEER' | 'MANAGER' | 'ADMIN';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string | null;
  phone?: string | null;
  reputationScore?: number;
}

/**
 * Update Profile Request Interface
 */
export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  password?: string;
}

/**
 * Users API Service
 * Handles all user profile-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class UsersApiService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  /**
   * Get current user profile
   */
  getProfile(): Observable<UserProfileResponse> {
    return this.apiService.get<UserProfileResponse>('/users/profile', true);
  }

  /**
   * Update user profile
   * Supports optional avatar file upload
   */
  updateProfile(
    data: UpdateProfileRequest,
    avatarFile?: File
  ): Observable<UserProfileResponse> {
    const formData = new FormData();

    // Add text fields
    if (data.fullName !== undefined) {
      formData.append('fullName', data.fullName);
    }
    if (data.phone !== undefined) {
      formData.append('phone', data.phone);
    }
    if (data.password !== undefined && data.password.trim() !== '') {
      formData.append('password', data.password);
    }

    // Add avatar file if provided
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    // Get access token for authorization
    const token = this.apiService.getAccessToken();
    const headers: { [key: string]: string } = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.http.patch<UserProfileResponse>(
      `${API_CONFIG.baseUrl}/users/profile`,
      formData,
      {
        headers,
        withCredentials: true
      }
    ).pipe(
      map((response) => response)
    );
  }
}

