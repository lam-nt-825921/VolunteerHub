import { Injectable, signal, effect, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
import { API_CONFIG } from './api.config';
import { AuthService } from './auth.service';
import { NotificationResponse } from './notifications-api.service';

/**
 * Socket Service
 * Manages WebSocket connection for real-time notifications
 * Implements connection management with automatic reconnection for minimal resource usage
 */
@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000; // Start with 1 second
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isManualDisconnect = false;

  // Connection state
  readonly isConnected = signal<boolean>(false);
  readonly connectionError = signal<string | null>(null);

  // Notification events
  private notificationSubject = new Subject<NotificationResponse>();
  readonly onNotification$: Observable<NotificationResponse> = this.notificationSubject.asObservable();

  // Unread count events
  private unreadCountSubject = new Subject<number>();
  readonly onUnreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

  constructor(private authService: AuthService) {
    // Auto-connect when user is authenticated, disconnect when logged out
    effect(() => {
      const user = this.authService.user();
      if (user && !this.socket?.connected) {
        // Use setTimeout to avoid writing signals inside effect
        setTimeout(() => this.connect(), 0);
      } else if (!user && this.socket) {
        // Use setTimeout to avoid writing signals inside effect
        setTimeout(() => this.disconnect(), 0);
      }
    });
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      return; // Already connected
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('[SocketService] No access token found, cannot connect');
      return;
    }

    // Clean up existing socket if any
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.isManualDisconnect = false;
    this.connectionError.set(null);

    const wsUrl = API_CONFIG.websocket.url;
    const namespace = API_CONFIG.websocket.namespace;

    try {
      this.socket = io(`${wsUrl}${namespace}`, {
        auth: {
          token: token
        },
        query: {
          token: token // Also pass in query string as fallback
        },
        transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
        reconnection: false, // We'll handle reconnection manually for better control
        autoConnect: true,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('[SocketService] Connection error:', error);
      this.connectionError.set('Failed to connect to notification server');
      this.scheduleReconnect();
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection successful
    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to notification server');
      this.isConnected.set(true);
      this.connectionError.set(null);
      this.reconnectAttempts = 0;

      // Request initial unread count
      this.socket?.emit('get_unread_count');
    });

    // Connection error
    this.socket.on('connect_error', (error: Error) => {
      console.error('[SocketService] Connection error:', error);
      this.isConnected.set(false);
      this.connectionError.set(error.message || 'Connection failed');
      
      if (!this.isManualDisconnect) {
        this.scheduleReconnect();
      }
    });

    // Disconnected
    this.socket.on('disconnect', (reason: string) => {
      console.log('[SocketService] Disconnected:', reason);
      this.isConnected.set(false);

      // Only reconnect if it was not a manual disconnect and not a server error
      if (!this.isManualDisconnect && reason !== 'io server disconnect') {
        this.scheduleReconnect();
      }
    });

    // Received notification
    this.socket.on('notification', (notification: NotificationResponse) => {
      console.log('[SocketService] Received notification:', notification);
      this.notificationSubject.next(notification);
    });

    // Received unread count update
    this.socket.on('unread_count', (data: { count: number }) => {
      console.log('[SocketService] Unread count update:', data.count);
      this.unreadCountSubject.next(data.count);
    });

    // Connection success confirmation
    this.socket.on('connected', (data: { userId: number; message: string }) => {
      console.log('[SocketService] Connection confirmed:', data);
    });
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.isManualDisconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('[SocketService] Max reconnection attempts reached');
        this.connectionError.set('Unable to connect to notification server');
      }
      return;
    }

    // Clear existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts); // Exponential backoff
    this.reconnectAttempts++;

    console.log(`[SocketService] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      const token = localStorage.getItem('accessToken');
      if (token && this.authService.isAuthenticated()) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isManualDisconnect = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected.set(false);
    this.reconnectAttempts = 0;
  }

  /**
   * Request current unread count
   */
  requestUnreadCount(): void {
    if (this.socket?.connected) {
      this.socket.emit('get_unread_count');
    }
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.disconnect();
    this.notificationSubject.complete();
    this.unreadCountSubject.complete();
  }
}

