import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const clienteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.getSesion();

  if (usuario && (usuario.rol === 'CLIENTE_TIENDA' || usuario.rol === 'CLIENTE_BOT')) {
    return true;
  }

  router.navigate(usuario ? ['/'] : ['/login']);
  return false;
};