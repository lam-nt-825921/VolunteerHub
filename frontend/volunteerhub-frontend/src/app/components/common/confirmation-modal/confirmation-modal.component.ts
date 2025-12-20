import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationService } from '../../../services/confirmation.service';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  constructor(public confirmationService: ConfirmationService) {}

  onAccept() {
    this.confirmationService.accept();
  }

  onCancel() {
    this.confirmationService.cancel();
  }

  onOverlayClick() {
    // Don't close on overlay click for confirmation - user must explicitly choose
  }
}

