import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const RUTAS_AUTH = ['/api/auth/login', '/api/auth/google', '/api/usuarios/registro'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (RUTAS_AUTH.some((ruta) => req.url.includes(ruta))) {
    return next(req);
  }

  const raw = localStorage.getItem('barberia_creds');
  if (!raw) {
    return next(req);
  }

  let token: string;
  try {
    const { correo, clave } = JSON.parse(raw);
    if (!correo || !clave) {
      return next(req);
    }
    token = btoa(`${correo}:${clave}`);
  } catch {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Basic ${token}` } })).pipe(
    catchError((error) => {
      if (error?.status === 401) {
        localStorage.removeItem('barberia_creds');
        localStorage.removeItem('barberia_usuario');
        return next(req);
      }
      return throwError(() => error);
    })
  );
};
