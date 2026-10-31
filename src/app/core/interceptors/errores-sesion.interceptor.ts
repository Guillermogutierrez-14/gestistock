import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/** Marca una petición que ya se reintentó tras renovar el token (evita bucles infinitos) */
const YA_REINTENTADA = new HttpContextToken<boolean>(() => false);

/**
 * Manejo centralizado de errores de sesión:
 * - 401: intenta UNA vez renovar el token (refresh token) y repetir la petición.
 *        Si no se puede, cierra la sesión y vuelve al login con returnUrl.
 * - 403: la sesión es válida pero RLS rechaza la operación → aviso con un toast.
 * Se registra ANTES de authInterceptor para que el reintento salga con el token nuevo.
 */
export const erroresSesionInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.supabaseUrl)) {
    return next(req);
  }
  const auth = inject(AuthService);
  const router = inject(Router);
  const toastCtrl = inject(ToastController);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }
      if (error.status === 401 && !req.context.get(YA_REINTENTADA)) {
        // token caducado: renovar y reintentar una sola vez
        return from(auth.refrescarSesion()).pipe(
          switchMap((renovada) => {
            if (!renovada) {
              void auth.expirarSesion(router.url);
              return throwError(() => error);
            }
            return next(req.clone({ context: req.context.set(YA_REINTENTADA, true) }));
          }),
        );
      }
      if (error.status === 401) {
        // el refresh tampoco sirvió
        void auth.expirarSesion(router.url);
      } else if (error.status === 403) {
        void toastCtrl
          .create({ message: 'No tienes permisos para realizar esta acción.', duration: 3000, color: 'danger' })
          .then((t) => t.present());
      }
      return throwError(() => error);
    }),
  );
};
