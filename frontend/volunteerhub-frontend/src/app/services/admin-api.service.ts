import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserProfileResponse } from './users-api.service';

/**
 * Filter Users Request Interface
 */
export interface FilterUsersRequest {
  keyword?: string;
  role?: 'VOLUNTEER' | 'MANAGER' | 'ADMIN';
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Users List Response Interface
 */
export interface UsersListResponse {
  data: UserProfileResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create User Request Interface
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role?: 'VOLUNTEER' | 'EVENT_MANAGER' | 'ADMIN';
}

/**
 * Update User Request Interface
 */
export interface UpdateUserRequest {
  fullName?: string;
  avatar?: string;
  phone?: string;
  role?: 'VOLUNTEER' | 'EVENT_MANAGER' | 'ADMIN';
  isActive?: boolean;
}

/**
 * Change Role Request Interface
 */
export interface ChangeRoleRequest {
  role: 'VOLUNTEER' | 'EVENT_MANAGER' | 'ADMIN';
}

/**
 * Toggle Active Request Interface
 */
export interface ToggleActiveRequest {
  isActive: boolean;
}

/**
 * Delete User Response Interface
 */
export interface DeleteUserResponse {
  message: string;
}

/**
 * Admin API Service
 * Handles all admin-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all users with filters and pagination
   */
  getUsers(filter?: FilterUsersRequest): Observable<UsersListResponse> {
    let url = '/admin/users';
    if (filter) {
      const params = new URLSearchParams();
      if (filter.keyword) params.append('keyword', filter.keyword);
      if (filter.role) params.append('role', filter.role);
      if (filter.isActive !== undefined) params.append('isActive', String(filter.isActive));
      if (filter.page) params.append('page', String(filter.page));
      if (filter.limit) params.append('limit', String(filter.limit));
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return this.apiService.get<UsersListResponse>(url, true);
  }

  /**
   * Get user by ID
   */
  getUserById(userId: number): Observable<UserProfileResponse> {
    return this.apiService.get<UserProfileResponse>(`/admin/users/${userId}`, true);
  }

  /**
   * Create new user
   */
  createUser(data: CreateUserRequest): Observable<UserProfileResponse> {
    return this.apiService.post<UserProfileResponse>('/admin/users', data, true);
  }

  /**
   * Update user
   */
  updateUser(userId: number, data: UpdateUserRequest): Observable<UserProfileResponse> {
    return this.apiService.patch<UserProfileResponse>(`/admin/users/${userId}`, data, true);
  }

  /**
   * Change user role
   */
  changeUserRole(userId: number, role: 'VOLUNTEER' | 'EVENT_MANAGER' | 'ADMIN'): Observable<UserProfileResponse> {
    return this.apiService.patch<UserProfileResponse>(
      `/admin/users/${userId}/role`,
      { role },
      true
    );
  }

  /**
   * Toggle user active status
   */
  toggleUserActive(userId: number, isActive: boolean): Observable<UserProfileResponse> {
    return this.apiService.patch<UserProfileResponse>(
      `/admin/users/${userId}/activate`,
      { isActive },
      true
    );
  }

  /**
   * Delete user (soft delete - sets isActive to false)
   */
  deleteUser(userId: number): Observable<DeleteUserResponse> {
    return this.apiService.delete<DeleteUserResponse>(`/admin/users/${userId}`, true);
  }
}

