// src/app/app.routes.ts
import { Routes }      from '@angular/router';
import { authGuard }   from 'E:/SiteSync/sitesync-angular/src/app/core/interceptors/guards/auth.guards';
import { roleGuard }   from 'E:/SiteSync/sitesync-angular/src/app/core/interceptors/guards/role.guards';

export const routes: Routes = [
  // ── Public ────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },

  // ── Protected (all roles) ─────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'sites',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Supervisor'] },
    loadComponent: () => import('./features/sites/sites.component').then(m => m.SitesComponent)
  },
  {
    path: 'clients',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () => import('./features/clients/clients.component').then(m => m.ClientsComponent)
  },
  {
    path: 'labour',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Supervisor', 'Labour'] },
    loadComponent: () => import('./features/labour/labour.component').then(m => m.LabourComponent)
  },
  {
    path: 'finance',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () => import('./features/finance/finance.component').then(m => m.FinanceComponent)
  },
  {
    path: 'analytics',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Supervisor'] },
    loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },

  { path: '**', redirectTo: '' }
];