import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from './api.config';

/**
 * Base API Service
 * Provides common HTTP methods and error handling
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  /**
   * Get base URL for API requests
   */
  getBaseUrl(): string {
    return API_CONFIG.baseUrl;
  }

  /**
   * Get default headers with authentication token if available
   */
  private getHeaders(includeAuth: boolean = true): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (includeAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Set access token in storage
   */
  setAccessToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  /**
   * Remove access token from storage
   */
  removeAccessToken(): void {
    localStorage.removeItem('accessToken');
  }

  /**
   * GET request
   */
  get<T>(url: string, includeAuth: boolean = true): Observable<T> {
    return this.http.get<T>(`${this.getBaseUrl()}${url}`, {
      headers: this.getHeaders(includeAuth),
      withCredentials: true // Important for httpOnly cookies (refresh token)
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST request
   */
  post<T>(url: string, body: any, includeAuth: boolean = false): Observable<T> {
    return this.http.post<T>(`${this.getBaseUrl()}${url}`, body, {
      headers: this.getHeaders(includeAuth),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request
   */
  put<T>(url: string, body: any, includeAuth: boolean = true): Observable<T> {
    return this.http.put<T>(`${this.getBaseUrl()}${url}`, body, {
      headers: this.getHeaders(includeAuth),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PATCH request
   */
  patch<T>(url: string, body: any, includeAuth: boolean = true): Observable<T> {
    return this.http.patch<T>(`${this.getBaseUrl()}${url}`, body, {
      headers: this.getHeaders(includeAuth),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request
   */
  delete<T>(url: string, includeAuth: boolean = true): Observable<T> {
    return this.http.delete<T>(`${this.getBaseUrl()}${url}`, {
      headers: this.getHeaders(includeAuth),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Đã xảy ra lỗi không xác định';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      } else if (error.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.status === 403) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
      } else if (error.status === 404) {
        errorMessage = 'Không tìm thấy tài nguyên.';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Dữ liệu đã tồn tại.';
      } else if (error.status >= 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      }
    }

    return throwError(() => new Error(errorMessage));
  };
}

