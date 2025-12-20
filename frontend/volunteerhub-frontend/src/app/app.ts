import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertModalComponent } from './components/common/alert-modal/alert-modal.component';
import { ConfirmationModalComponent } from './components/common/confirmation-modal/confirmation-modal.component';
import { AlertService } from './services/alert.service';
import { ConfirmationService } from './services/confirmation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertModalComponent, ConfirmationModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(
    public alertService: AlertService,
    public confirmationService: ConfirmationService
  ) {}
}
