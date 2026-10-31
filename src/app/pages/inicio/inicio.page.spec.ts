import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioPage } from './inicio.page';
import { AuthService } from '../../core/services/auth.service';

describe('InicioPage', () => {
  let fixture: ComponentFixture<InicioPage>;

  beforeEach(async () => {
    const authFalso = {
      perfil: signal({ id: '1', nombre: 'Administrador', email: 'admin@gestistock.com', rol: 'admin' }),
      esAdmin: signal(true),
    };
    await TestBed.configureTestingModule({
      imports: [InicioPage],
      providers: [{ provide: AuthService, useValue: authFalso }],
    }).compileComponents();
    fixture = TestBed.createComponent(InicioPage);
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('saluda al usuario por su nombre', () => {
    expect(fixture.nativeElement.textContent).toContain('Hola, Administrador');
  });

  it('muestra el aviso de acceso denegado cuando llega ?acceso=denegado', () => {
    fixture.componentRef.setInput('acceso', 'denegado');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('No tienes permisos');
  });
});
