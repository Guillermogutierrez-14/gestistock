import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { DashboardPage } from './dashboard.page';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { Producto } from '../../core/models/producto.model';
import { Movimiento } from '../../core/models/movimiento.model';

const PRODUCTOS: Producto[] = [
  { id: 1, codigo: 'INF-1', nombre: 'A', categoria: 'Informática', precio: 10, stock: 5, stock_minimo: 2, creado_en: '' },
  { id: 2, codigo: 'OFI-1', nombre: 'B', categoria: 'Oficina', precio: 2, stock: 1, stock_minimo: 3, creado_en: '' },
];
const hoy = new Date().toISOString();
const movimiento = (id: number, productoId: number, tipo: 'entrada' | 'salida', cantidad: number): Movimiento => ({
  id, creado_en: hoy, usuario_email: 'x@x.com',
  datos: { tipo, producto_id: productoId, producto_codigo: '', producto_nombre: '', cantidad },
});

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let pagina: DashboardPage;
  let enDirecto: Subject<Movimiento>;

  beforeEach(async () => {
    enDirecto = new Subject<Movimiento>();
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        { provide: ProductoService, useValue: { obtenerTodos: () => of(PRODUCTOS) } },
        {
          provide: MovimientoService,
          useValue: {
            obtenerRecientes: async () => [movimiento(1, 1, 'entrada', 4), movimiento(2, 2, 'salida', 1)],
            escucharNuevos: () => enDirecto.asObservable(),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardPage);
    pagina = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('calcula los indicadores con todas las categorías', () => {
    expect(pagina.totalProductos()).toBe(2);
    expect(pagina.totalUnidades()).toBe(6);
    expect(pagina.valorInventario()).toBe(52);
    expect(pagina.totalStockBajo()).toBe(1);
  });

  it('el filtro por categoría recalcula todo al instante', () => {
    pagina.cambiarCategoria('Informática');
    expect(pagina.totalProductos()).toBe(1);
    expect(pagina.movimientosFiltrados().length).toBe(1);
  });

  it('pulsar una porción del doughnut filtra, y pulsarla otra vez quita el filtro', () => {
    pagina.onCategoriaPulsada(0); // 'Informática' (orden alfabético)
    expect(pagina.categoriaSeleccionada()).toBe('Informática');
    pagina.onCategoriaPulsada(0);
    expect(pagina.categoriaSeleccionada()).toBe('Todas');
  });

  it('suma las entradas y salidas de hoy en el gráfico de líneas', () => {
    const datos = pagina.datosMovimientos().datasets;
    expect(datos[0].data.at(-1)).toBe(4); // entradas hoy
    expect(datos[1].data.at(-1)).toBe(1); // salidas hoy
  });

  it('se actualiza en tiempo real cuando llega un movimiento', () => {
    enDirecto.next(movimiento(3, 1, 'salida', 2));
    expect(pagina.totalUnidades()).toBe(4); // 6 - 2
  });
});
