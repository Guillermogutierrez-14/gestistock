import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { MovimientosPage } from './movimientos.page';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { Movimiento } from '../../core/models/movimiento.model';
import { Producto } from '../../core/models/producto.model';

const PRODUCTO: Producto = { id: 1, codigo: 'A-1', nombre: 'Uno', categoria: 'X', precio: 1, stock: 10, stock_minimo: 1, creado_en: '' };
const crearMovimiento = (id: number, cantidad = 2): Movimiento => ({
  id,
  creado_en: '2026-10-26T10:00:00Z',
  usuario_email: 'usuario@gestistock.com',
  datos: { tipo: 'salida', producto_id: 1, producto_codigo: 'A-1', producto_nombre: 'Uno', cantidad },
});

describe('MovimientosPage', () => {
  let fixture: ComponentFixture<MovimientosPage>;
  let pagina: MovimientosPage;
  let enDirecto: Subject<Movimiento>;
  const movimientoFalso = {
    obtenerRecientes: vi.fn(async () => [crearMovimiento(1)]),
    escucharNuevos: vi.fn(() => enDirecto.asObservable()),
    registrar: vi.fn(async () => undefined),
  };

  beforeEach(async () => {
    enDirecto = new Subject<Movimiento>();
    movimientoFalso.registrar.mockClear();
    await TestBed.configureTestingModule({
      imports: [MovimientosPage],
      providers: [
        { provide: ProductoService, useValue: { obtenerTodos: () => of([PRODUCTO]) } },
        { provide: MovimientoService, useValue: movimientoFalso },
        { provide: ToastController, useValue: { create: async () => ({ present: async () => undefined }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MovimientosPage);
    pagina = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable(); // espera al forkJoin
  });

  it('carga productos y movimientos en paralelo (forkJoin)', () => {
    expect(pagina.productos().length).toBe(1);
    expect(pagina.movimientos().length).toBe(1);
  });

  it('añade arriba los movimientos que llegan en tiempo real y actualiza el stock', () => {
    enDirecto.next(crearMovimiento(2, 3));
    expect(pagina.movimientos()[0].id).toBe(2);
    expect(pagina.ultimoEnDirecto()).toBe(2);
    expect(pagina.productos()[0].stock).toBe(7); // 10 - 3
  });

  it('no registra si no se ha elegido producto', async () => {
    await pagina.registrar();
    expect(movimientoFalso.registrar).not.toHaveBeenCalled();
  });

  it('registra el movimiento con el documento JSON correcto', async () => {
    pagina.formulario.patchValue({ tipo: 'entrada', productoId: 1, cantidad: 5, nota: 'Prueba' });
    await pagina.registrar();
    expect(movimientoFalso.registrar).toHaveBeenCalledWith({
      tipo: 'entrada', producto_id: 1, producto_codigo: 'A-1', producto_nombre: 'Uno', cantidad: 5, nota: 'Prueba',
    });
  });

  it('aplana los documentos JSON a filas para el informe', () => {
    const fila = pagina.filasInforme()[0];
    expect(fila.tipo).toBe('Salida');
    expect(fila.codigo).toBe('A-1');
    expect(fila.cantidad).toBe(2);
  });
});
