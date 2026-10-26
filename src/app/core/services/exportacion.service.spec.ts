import { TestBed } from '@angular/core/testing';
import { ExportacionService } from './exportacion.service';
import { ColumnaTabla } from '../../shared/components/tabla-datos/tabla-datos.component';

interface Fila {
  nombre: string;
  precio: number;
  stock: number;
}

describe('ExportacionService', () => {
  const columnas: ColumnaTabla<Fila>[] = [
    { campo: 'nombre', titulo: 'Nombre' },
    { campo: 'precio', titulo: 'Precio', tipo: 'moneda' },
    { campo: 'stock', titulo: 'Stock', tipo: 'numero' },
  ];
  let servicio: ExportacionService;

  beforeEach(() => {
    servicio = TestBed.inject(ExportacionService);
  });

  it('genera la cabecera con ";" como separador', () => {
    expect(servicio.generarCSV(columnas, []).split('\r\n')[0]).toBe('Nombre;Precio;Stock');
  });

  it('formatea los precios con coma decimal y 2 decimales', () => {
    const csv = servicio.generarCSV(columnas, [{ nombre: 'Ratón', precio: 24.9, stock: 40 }]);
    expect(csv.split('\r\n')[1]).toBe('Ratón;24,90;40');
  });

  it('escapa los textos que contienen ; o comillas', () => {
    const csv = servicio.generarCSV(columnas, [{ nombre: 'Monitor 27" 4K; HDR', precio: 1, stock: 1 }]);
    expect(csv.split('\r\n')[1]).toBe('"Monitor 27"" 4K; HDR";1,00;1');
  });
});
