import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP: a cada petición dirigida a la API REST de Supabase le añade
 * la clave pública (apikey) y el token JWT del usuario (Authorization: Bearer).
 * Así ningún servicio tiene que repetir estas cabeceras.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.supabaseUrl)) {
    return next(req);
  }
  const token = inject(AuthService).getToken();
  const cabeceras: Record<string, string> = { apikey: environment.supabaseKey };
  if (token) {
    cabeceras['Authorization'] = `Bearer ${token}`;
  }
  return next(req.clone({ setHeaders: cabeceras }));
};
