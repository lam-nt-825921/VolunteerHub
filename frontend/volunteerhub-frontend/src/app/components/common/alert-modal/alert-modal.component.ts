import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './alert-modal.component.html',
  styleUrl: './alert-modal.component.scss'
})
export class AlertModalComponent {
  @Input() message: string = '';
  @Input() type: AlertType = 'info';
  @Input() title?: string;
  @Output() close = new EventEmitter<void>();

  getIcon(): string {
    switch (this.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }

  getTitle(): string {
    if (this.title) return this.title;
    switch (this.type) {
      case 'success':
        return 'Thành công';
      case 'error':
        return 'Lỗi';
      case 'warning':
        return 'Cảnh báo';
      default:
        return 'Thông báo';
    }
  }

  onClose() {
    this.close.emit();
  }

  onOverlayClick() {
    this.onClose();
  }
}

