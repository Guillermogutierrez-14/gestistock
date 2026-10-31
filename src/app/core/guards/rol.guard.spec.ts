import { TestBed } from '@angular/core/testing';
import { Route, Router, UrlSegment, UrlTree, provideRouter } from '@angular/router';
import { rolGuard } from './rol.guard';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/perfil.model';

/** Ejecuta el guard dentro del contexto de inyección, como hace el router */
function ejecutar(autenticado: boolean, rol: Rol | null) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: AuthService,
        useValue: {
          esperarInicializacion: async () => undefined,
          estaAutenticado: () => autenticado,
          tieneRol: (...roles: Rol[]) => rol !== null && roles.includes(rol),
        },
      },
    ],
  });
  const segmentos = [new UrlSegment('dashboard', {})];
  return TestBed.runInInjectionContext(() => rolGuard('admin')({} as Route, segmentos, {} as never)) as Promise<boolean | UrlTree>;
}

describe('rolGuard (canMatch)', () => {
  it('deja pasar al administrador', async () => {
    expect(await ejecutar(true, 'admin')).toBe(true);
  });

  it('envía al usuario estándar a /inicio?acceso=denegado', async () => {
    const resultado = await ejecutar(true, 'usuario');
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/inicio?acceso=denegado');
  });

  it('sin sesión envía al login recordando la ruta en returnUrl', async () => {
    const resultado = await ejecutar(false, null);
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/login?returnUrl=%2Fdashboard');
  });
});
