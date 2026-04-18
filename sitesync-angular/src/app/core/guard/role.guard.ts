// src/app/core/guards/role.guard.ts
import { inject }              from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { Router }              from '@angular/router';
import { AuthService }         from '../services/auth.service';
import { UserRole }            from '../models/auth.models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Roles allowed for this route — set in route data: { roles: ['Admin','Supervisor'] }
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) return true;

  const userRole = auth.role();
  if (userRole && allowedRoles.includes(userRole)) return true;

  // Logged in but wrong role → go to dashboard with a message
  router.navigate(['/']);
  return false;
};