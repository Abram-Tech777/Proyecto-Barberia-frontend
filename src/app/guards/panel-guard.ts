import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const panelGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esAdmin() || authService.esBarbero()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};