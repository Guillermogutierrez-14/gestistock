import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AyudaPage } from './ayuda.page';
import { AuthService } from '../../core/services/auth.service';

async function crear(esAdmin: boolean): Promise<ComponentFixture<AyudaPage>> {
  await TestBed.configureTestingModule({
    imports: [AyudaPage],
    providers: [{ provide: AuthService, useValue: { esAdmin: signal(esAdmin) } }],
  }).compileComponents();
  const fixture = TestBed.createComponent(AyudaPage);
  fixture.detectChanges();
  return fixture;
}

describe('AyudaPage', () => {
  it('el administrador ve la ayuda de alta de productos', async () => {
    const fixture = await crear(true);
    expect(fixture.nativeElement.textContent).toContain('Dar de alta un producto');
  });

  it('el usuario estándar no ve las secciones de administrador', async () => {
    const fixture = await crear(false);
    expect(fixture.nativeElement.textContent).not.toContain('Cuadro de mando');
  });
});
