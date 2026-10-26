import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Para la pantalla de login: si ya hay sesión iniciada, lleva directamente a Inicio. */
export const invitadoGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.esperarInicializacion();
  return auth.estaAutenticado() ? router.createUrlTree(['/inicio']) : true;
};
