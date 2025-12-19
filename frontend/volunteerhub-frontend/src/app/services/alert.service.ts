import { Injectable, signal } from '@angular/core';
import { AlertType } from '../components/common/alert-modal/alert-modal.component';

export interface AlertState {
  show: boolean;
  message: string;
  type: AlertType;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertState = signal<AlertState>({
    show: false,
    message: '',
    type: 'info'
  });

  readonly alert = this.alertState.asReadonly();

  show(message: string, type: AlertType = 'info', title?: string) {
    this.alertState.set({
      show: true,
      message,
      type,
      title
    });
  }

  showSuccess(message: string, title?: string) {
    this.show(message, 'success', title);
  }

  showError(message: string, title?: string) {
    this.show(message, 'error', title);
  }

  showWarning(message: string, title?: string) {
    this.show(message, 'warning', title);
  }

  showInfo(message: string, title?: string) {
    this.show(message, 'info', title);
  }

  close() {
    this.alertState.set({
      show: false,
      message: '',
      type: 'info'
    });
  }
}

