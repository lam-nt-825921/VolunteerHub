import { Injectable, signal } from '@angular/core';

export interface ConfirmationState {
  show: boolean;
  message: string;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationState = signal<ConfirmationState>({
    show: false,
    message: '',
    title: 'Xác nhận'
  });

  private resolveCallback: ((value: boolean) => void) | null = null;

  readonly confirmation = this.confirmationState.asReadonly();

  /**
   * Show confirmation dialog and return a Promise<boolean>
   * Usage: const confirmed = await confirmationService.confirm('Are you sure?');
   */
  confirm(message: string, title: string = 'Xác nhận'): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
      this.confirmationState.set({
        show: true,
        message,
        title
      });
    });
  }

  accept() {
    if (this.resolveCallback) {
      this.resolveCallback(true);
      this.resolveCallback = null;
    }
    this.close();
  }

  cancel() {
    if (this.resolveCallback) {
      this.resolveCallback(false);
      this.resolveCallback = null;
    }
    this.close();
  }

  close() {
    this.confirmationState.set({
      show: false,
      message: '',
      title: 'Xác nhận'
    });
  }
}

