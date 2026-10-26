import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginPage } from './login.page';
import { AuthService } from '../../core/services/auth.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  const authFalso = { login: vi.fn() };

  beforeEach(async () => {
    authFalso.login.mockReset();
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: authFalso }],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario es inválido con un email incorrecto', () => {
    component.formulario.setValue({ email: 'no-es-un-email', password: '123456' });
    expect(component.formulario.invalid).toBe(true);
  });

  it('no intenta iniciar sesión si el formulario es inválido', async () => {
    await component.iniciarSesion();
    expect(authFalso.login).not.toHaveBeenCalled();
  });

  it('llama a AuthService.login con los datos del formulario', async () => {
    authFalso.login.mockResolvedValue(undefined);
    component.formulario.setValue({ email: 'admin@gestistock.com', password: '123456' });
    await component.iniciarSesion();
    expect(authFalso.login).toHaveBeenCalledWith('admin@gestistock.com', '123456');
  });
});
