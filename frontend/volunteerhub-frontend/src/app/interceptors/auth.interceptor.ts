import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, from } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

/**
 * HTTP Interceptor for Authentication
 * - Automatically attaches access token to requests
 * - Handles 401 errors by attempting token refresh
 * - Logs out user if refresh fails
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Get access token from localStorage
    const token = localStorage.getItem('accessToken');

    // Add authorization header if token exists and request needs auth
    // Skip adding token for public endpoints (login, register, refresh)
    const isPublicEndpoint = req.url.includes('/login') || 
                            req.url.includes('/register') || 
                            req.url.includes('/refresh');

    if (token && !isPublicEndpoint && !req.headers.has('Authorization')) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          // Don't try to refresh if this is already a refresh or logout request
          const isRefreshRequest = req.url.includes('/refresh');
          const isLogoutRequest = req.url.includes('/logout');
          const isPublicEndpoint = req.url.includes('/login') || req.url.includes('/register');
          
          if (!isRefreshRequest && !isLogoutRequest && !isPublicEndpoint && this.authService.isAuthenticated()) {
            return this.handle401Error(req, next);
          } else {
            // For refresh/logout failures, or if not authenticated, just clear session
            if (isRefreshRequest || isLogoutRequest) {
              // Clear session if refresh or logout fails
              this.authService.logout().catch(() => {
                // If logout fails, at least clear local state
              });
            }
          }
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return from(this.authService.refreshToken()).pipe(
        switchMap((success) => {
          this.isRefreshing = false;

          if (success) {
            const token = localStorage.getItem('accessToken');
            this.refreshTokenSubject.next(token);
            return next.handle(this.addTokenHeader(req, token));
          } else {
            // Refresh failed, clear session and redirect
            this.authService.logout().catch(() => {
              // If logout fails, at least clear local state
            });
            return throwError(() => new Error('Session expired. Please log in again.'));
          }
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout().catch(() => {
            // If logout fails, at least clear local state
          });
          return throwError(() => error);
        })
      );
    }

    // If already refreshing, wait for the new token
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(req, token)))
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return request;
  }
}

