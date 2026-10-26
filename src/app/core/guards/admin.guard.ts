import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Solo deja entrar a administradores. Un usuario estándar es enviado a Inicio. */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.esperarInicializacion();
  if (!auth.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }
  return auth.esAdmin() ? true : router.createUrlTree(['/inicio']);
};
