import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [() => {
      const authService = inject(AuthService);
      const router = inject(Router);
      if (!authService.isAuthenticated()) {
        router.navigate(['/']);
        return false;
      }
      return true;
    }]
  },
  {
    path: 'events',
    loadComponent: () => import('./components/events/events-list/events-list.component').then(m => m.EventsListComponent)
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./components/events/event-detail/event-detail.component').then(m => m.EventDetailComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

