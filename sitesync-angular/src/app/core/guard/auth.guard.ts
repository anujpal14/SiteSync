// src/app/core/guards/auth.guard.ts
import { inject }         from '@angular/core';
import { CanActivateFn }  from '@angular/router';
import { Router }         from '@angular/router';
import { AuthService }    from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isTokenValid()) {
    return true;
  }

  // Not logged in → send to login
  router.navigate(['/login']);
  return false;
};