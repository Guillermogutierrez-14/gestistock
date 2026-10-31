import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { PERMISOS_POR_ROL, Permiso } from './core/models/perfil.model';

/** AuthService falso: así el test no se conecta a Supabase */
function crearAuthFalso(esAdmin: boolean) {
  return {
    estaAutenticado: signal(true),
    esAdmin: signal(esAdmin),
    tienePermiso: (p: Permiso) => PERMISOS_POR_ROL[esAdmin ? 'admin' : 'usuario'].includes(p),
    perfil: signal({ id: '1', nombre: 'Prueba', email: 'prueba@test.com', rol: esAdmin ? 'admin' : 'usuario' }),
    logout: vi.fn(),
  };
}

async function crearComponente(esAdmin: boolean) {
  await TestBed.configureTestingModule({
    imports: [AppComponent],
    providers: [provideRouter([]), { provide: AuthService, useValue: crearAuthFalso(esAdmin) }],
  }).compileComponents();
  const fixture = TestBed.createComponent(AppComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function rutasDelMenu(fixture: Awaited<ReturnType<typeof crearComponente>>): string[] {
  const router = TestBed.inject(Router);
  return fixture.debugElement
    .queryAll(By.directive(RouterLink))
    .map((el) => router.serializeUrl(el.injector.get(RouterLink).urlTree!));
}

describe('AppComponent', () => {
  it('debería crear la aplicación', async () => {
    const fixture = await crearComponente(true);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('el administrador ve las 6 opciones del menú', async () => {
    const fixture = await crearComponente(true);
    expect(rutasDelMenu(fixture)).toEqual(['/inicio', '/productos', '/movimientos', '/productos/nuevo', '/dashboard', '/ayuda']);
  });

  it('el usuario estándar NO ve las opciones de administrador', async () => {
    const fixture = await crearComponente(false);
    expect(rutasDelMenu(fixture)).toEqual(['/inicio', '/productos', '/movimientos', '/ayuda']);
  });

  it('muestra la opción de cerrar sesión', async () => {
    const fixture = await crearComponente(false);
    expect(fixture.nativeElement.textContent).toContain('Cerrar sesión');
  });
});
