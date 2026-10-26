import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductoService } from './producto.service';
import { environment } from '../../../environments/environment';

describe('ProductoService', () => {
  let servicio: ProductoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(ProductoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('obtenerTodos hace un GET a la API REST de productos', () => {
    servicio.obtenerTodos().subscribe((productos) => expect(productos.length).toBe(1));
    const peticion = http.expectOne((req) => req.url === `${environment.supabaseUrl}/rest/v1/productos`);
    expect(peticion.request.method).toBe('GET');
    expect(peticion.request.params.get('order')).toBe('nombre.asc');
    peticion.flush([{ id: 1, codigo: 'A', nombre: 'A', categoria: 'X', precio: 1, stock: 1, stock_minimo: 1, creado_en: '' }]);
  });

  it('existeCodigo devuelve true si la API encuentra el código', () => {
    servicio.existeCodigo('INF-001').subscribe((existe) => expect(existe).toBe(true));
    const peticion = http.expectOne((req) => req.params.get('codigo') === 'eq.INF-001');
    peticion.flush([{ id: 1 }]);
  });
});
