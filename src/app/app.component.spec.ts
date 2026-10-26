import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('debería crear la aplicación', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería mostrar las 5 opciones del menú', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const labels = fixture.nativeElement.querySelectorAll('ion-label');
    expect(labels.length).toEqual(5);
    expect(labels[0].innerHTML).toContain('Inicio');
    expect(labels[1].innerHTML).toContain('Productos');
  });

  it('debería tener las rutas correctas en el menú', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const links = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map((el) => el.injector.get(RouterLink));
    expect(links.length).toEqual(5);
    expect(router.serializeUrl(links[0].urlTree!)).toEqual('/inicio');
    expect(router.serializeUrl(links[1].urlTree!)).toEqual('/productos');
  });
});