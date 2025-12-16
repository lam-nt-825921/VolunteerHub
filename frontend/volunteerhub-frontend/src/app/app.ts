import { Component } from '@angular/core';
import { LandingComponent } from './components/landing/landing.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LandingComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
