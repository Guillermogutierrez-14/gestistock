import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Solo deja entrar a usuarios con sesión iniciada (cualquier rol). */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.esperarInicializacion();
  return auth.estaAutenticado() ? true : router.createUrlTree(['/login']);
};
