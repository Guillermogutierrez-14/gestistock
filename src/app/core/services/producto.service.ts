import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NuevoProducto, Producto } from '../models/producto.model';

/**
 * Servicio de productos (capa Modelo en MVVM).
 * Consume la API REST que Supabase genera automáticamente sobre PostgreSQL (fuente SQL).
 * Usa HttpClient, que devuelve Observables de RxJS (programación asíncrona).
 * Las cabeceras de autenticación (apikey + token JWT) las añade el interceptor HTTP.
 */
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.supabaseUrl}/rest/v1/productos`;

  /** GET /productos?select=*&order=nombre.asc */
  obtenerTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.url, {
      params: { select: '*', order: 'nombre.asc' },
    });
  }

  /** Comprueba si ya existe un producto con ese código (para la validación asíncrona) */
  existeCodigo(codigo: string): Observable<boolean> {
    return this.http
      .get<{ id: number }[]>(this.url, { params: { select: 'id', codigo: `eq.${codigo}` } })
      .pipe(map((filas) => filas.length > 0));
  }

  /** POST /productos  (solo permitido al administrador por la política RLS) */
  crear(producto: NuevoProducto): Observable<Producto> {
    return this.http
      .post<Producto[]>(this.url, producto, { headers: { Prefer: 'return=representation' } })
      .pipe(map((filas) => filas[0]));
  }
}
