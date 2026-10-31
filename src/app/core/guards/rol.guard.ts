import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { Rol } from '../models/perfil.model';
import { AuthService } from '../services/auth.service';

/**
 * Autorización por rol (canMatch). Es una FÁBRICA: recibe los roles permitidos
 * y devuelve el guard. Se ejecuta ANTES de descargar el chunk lazy de la ruta,
 * así un usuario sin el rol nunca recibe el código de la página.
 */
export const rolGuard = (...roles: Rol[]): CanMatchFn => async (_route, segmentos) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.esperarInicializacion();
  if (!auth.estaAutenticado()) {
    // 1º autenticación
    const returnUrl = '/' + segmentos.map((s) => s.path).join('/');
    return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }
  // 2º autorización
  return auth.tieneRol(...roles)
    ? true
    : router.createUrlTree(['/inicio'], { queryParams: { acceso: 'denegado' } });
};
