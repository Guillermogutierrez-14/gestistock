import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProductosPage } from './productos.page';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/models/producto.model';
import { AuthService } from '../../core/services/auth.service';
import { Rol } from '../../core/models/perfil.model';

const PRODUCTOS: Producto[] = [
  { id: 1, codigo: 'A-1', nombre: 'Uno', categoria: 'X', precio: 10, stock: 2, stock_minimo: 5, creado_en: '' },
  { id: 2, codigo: 'A-2', nombre: 'Dos', categoria: 'X', precio: 5, stock: 10, stock_minimo: 5, creado_en: '' },
];

describe('ProductosPage', () => {
  let fixture: ComponentFixture<ProductosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosPage],
      providers: [
        provideRouter([]),
        { provide: ProductoService, useValue: { obtenerTodos: () => of(PRODUCTOS) } },
        { provide: AuthService, useValue: { tieneRol: (...roles: Rol[]) => roles.includes('usuario') } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductosPage);
    fixture.detectChanges();
  });

  it('muestra una fila por producto en la tabla', () => {
    expect(fixture.nativeElement.querySelectorAll('app-tabla-datos tbody tr').length).toBe(2);
  });

  it('el widget de stock bajo cuenta los productos con stock <= mínimo', () => {
    const widgets = fixture.nativeElement.querySelectorAll('app-widget-estadistica');
    expect(widgets[1].textContent).toContain('1');
  });

  it('al pulsar el widget "Stock bajo" filtra la tabla', () => {
    const widgets = fixture.nativeElement.querySelectorAll('app-widget-estadistica button');
    widgets[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-tabla-datos tbody tr').length).toBe(1);
  });

  it('exporta solo los productos que coinciden con la búsqueda', () => {
    fixture.componentInstance.busqueda.set('dos');
    expect(fixture.componentInstance.productosExportables().map((p) => p.codigo)).toEqual(['A-2']);
  });

  it('el usuario estándar NO tiene el botón "Nuevo producto" en el DOM', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Nuevo producto');
  });
});
