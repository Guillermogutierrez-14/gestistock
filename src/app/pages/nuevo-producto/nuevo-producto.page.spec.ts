import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { NuevoProductoPage } from './nuevo-producto.page';
import { ProductoService } from '../../core/services/producto.service';

/** Espera real (para dejar terminar la validación asíncrona, que tiene 400 ms de espera) */
const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

describe('NuevoProductoPage', () => {
  let fixture: ComponentFixture<NuevoProductoPage>;
  let pagina: NuevoProductoPage;
  const servicioFalso = {
    existeCodigo: vi.fn((codigo: string) => of(codigo === 'INF-001')),
    crear: vi.fn(() => of({ id: 99, nombre: 'Nuevo' })),
  };

  beforeEach(async () => {
    servicioFalso.crear.mockClear();
    await TestBed.configureTestingModule({
      imports: [NuevoProductoPage],
      providers: [
        provideRouter([]),
        { provide: ProductoService, useValue: servicioFalso },
        { provide: ToastController, useValue: { create: async () => ({ present: async () => undefined }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NuevoProductoPage);
    pagina = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('rechaza un código con formato incorrecto (validación síncrona)', () => {
    pagina.formulario.controls.codigo.setValue('abc');
    expect(pagina.formulario.controls.codigo.hasError('pattern')).toBe(true);
  });

  it('marca como duplicado un código que ya existe (validación asíncrona)', async () => {
    pagina.formulario.controls.codigo.setValue('INF-001');
    expect(pagina.formulario.controls.codigo.pending).toBe(true); // está "comprobando"
    await esperar(500);
    expect(pagina.formulario.controls.codigo.hasError('codigoDuplicado')).toBe(true);
  });

  it('acepta un código libre', async () => {
    pagina.formulario.controls.codigo.setValue('INF-999');
    await esperar(500);
    expect(pagina.formulario.controls.codigo.valid).toBe(true);
  });

  it('calcula la vista previa del valor total (precio × stock)', () => {
    pagina.formulario.patchValue({ precio: 10, stock: 3 });
    expect(pagina.valorTotal()).toBe(30);
  });

  it('no guarda si el formulario es inválido', async () => {
    await pagina.guardar();
    expect(servicioFalso.crear).not.toHaveBeenCalled();
  });

  it('guarda el producto si el formulario es válido', async () => {
    pagina.formulario.setValue({
      codigo: 'INF-999', nombre: 'Tablet 10"', categoria: 'Informática', precio: 199, stock: 4, stock_minimo: 2,
    });
    pagina.seguirAnadiendo = true; // así no navega a otra página durante el test
    await esperar(500);
    await pagina.guardar();
    expect(servicioFalso.crear).toHaveBeenCalledTimes(1);
  });
});
