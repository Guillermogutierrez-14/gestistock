import { Injectable, inject } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { Rol } from '../models/perfil.model';
import { AuthService } from '../services/auth.service';

/**
 * Estrategia de precarga propia. PreloadAllModules descargaría en segundo plano
 * TODAS las páginas sin ejecutar canMatch, anulando su ventaja. Esta solo precarga
 * las rutas con `data.roles` si el usuario tiene alguno de esos roles.
 */
@Injectable({ providedIn: 'root' })
export class PrecargaSegunRol implements PreloadingStrategy {
  private readonly auth = inject(AuthService);

  preload(route: Route, cargar: () => Observable<unknown>): Observable<unknown> {
    const roles = route.data?.['roles'] as Rol[] | undefined;
    if (!roles) {
      return cargar();
    }
    return this.auth.tieneRol(...roles) ? cargar() : EMPTY;
  }
}
