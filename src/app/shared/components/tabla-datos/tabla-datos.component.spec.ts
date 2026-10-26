import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnaTabla, TablaDatosComponent } from './tabla-datos.component';

interface Fruta {
  nombre: string;
  precio: number;
}

describe('TablaDatosComponent', () => {
  let fixture: ComponentFixture<TablaDatosComponent<Fruta>>;
  let componente: TablaDatosComponent<Fruta>;
  const columnas: ColumnaTabla<Fruta>[] = [
    { campo: 'nombre', titulo: 'Nombre' },
    { campo: 'precio', titulo: 'Precio', tipo: 'moneda' },
  ];
  const datos: Fruta[] = [
    { nombre: 'Manzana', precio: 1 },
    { nombre: 'Pera', precio: 2 },
    { nombre: 'Mango', precio: 3 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TablaDatosComponent] }).compileComponents();
    fixture = TestBed.createComponent(TablaDatosComponent<Fruta>);
    componente = fixture.componentInstance;
    fixture.componentRef.setInput('datos', datos);
    fixture.componentRef.setInput('columnas', columnas);
    fixture.detectChanges();
  });

  function filas(): NodeListOf<HTMLTableRowElement> {
    return fixture.nativeElement.querySelectorAll('tbody tr');
  }

  it('muestra una fila por cada dato recibido por input', () => {
    expect(filas().length).toBe(3);
  });

  it('filtra las filas al buscar y emite el texto buscado', () => {
    const emitido: string[] = [];
    componente.busquedaCambiada.subscribe((texto) => emitido.push(texto));
    componente.onBuscar(new CustomEvent('ionInput', { detail: { value: 'ma' } }));
    fixture.detectChanges();
    expect(filas().length).toBe(2); // Manzana y Mango
    expect(emitido).toEqual(['ma']);
  });

  it('emite la fila seleccionada al hacer clic', () => {
    const seleccionadas: Fruta[] = [];
    componente.filaSeleccionada.subscribe((fila) => seleccionadas.push(fila));
    filas()[1].click();
    expect(seleccionadas).toEqual([datos[1]]);
  });
});
