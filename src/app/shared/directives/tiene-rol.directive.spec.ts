import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TieneRolDirective } from './tiene-rol.directive';
import { AuthService } from '../../core/services/auth.service';
import { Rol } from '../../core/models/perfil.model';

@Component({
  imports: [TieneRolDirective],
  template: `<button *appTieneRol="'admin'">Solo admin</button><p>Para todos</p>`,
})
class PruebaComponent {}

describe('TieneRolDirective (*appTieneRol)', () => {
  const rolActual = signal<Rol | null>('usuario');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PruebaComponent],
      providers: [
        { provide: AuthService, useValue: { tieneRol: (...roles: Rol[]) => rolActual() !== null && roles.includes(rolActual()!) } },
      ],
    });
  });

  it('no crea el elemento si el rol no coincide', () => {
    rolActual.set('usuario');
    const fixture = TestBed.createComponent(PruebaComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('crea el elemento para el administrador y lo quita si cambia el rol', () => {
    rolActual.set('admin');
    const fixture = TestBed.createComponent(PruebaComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).not.toBeNull();
    rolActual.set('usuario');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
