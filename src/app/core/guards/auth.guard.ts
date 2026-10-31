import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Autenticación (canActivate): solo deja entrar a usuarios con sesión (cualquier rol).
 * Si no hay sesión, envía al login recordando la URL pedida en `returnUrl`.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService); // contexto de inyección: antes de cualquier await
  const router = inject(Router);
  await auth.esperarInicializacion(); // espera a restaurar la sesión guardada
  return auth.estaAutenticado()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
