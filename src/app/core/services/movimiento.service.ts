import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { DocumentoMovimiento, Movimiento } from '../models/movimiento.model';

/**
 * Servicio de movimientos (fuente NoSQL documental + TIEMPO REAL).
 * - Lee y escribe documentos JSON (columna JSONB) con el cliente de Supabase (Promises / async-await).
 * - Escucha los nuevos movimientos en tiempo real con Supabase Realtime (WebSockets),
 *   y los expone como un Observable de RxJS.
 */
@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly supabase = inject(SupabaseService).client;

  /** Últimos movimientos, del más reciente al más antiguo */
  async obtenerRecientes(limite = 50): Promise<Movimiento[]> {
    const { data, error } = await this.supabase
      .from('movimientos')
      .select('id, creado_en, usuario_email, datos')
      .order('creado_en', { ascending: false })
      .limit(limite);
    if (error) {
      throw new Error('No se pudieron cargar los movimientos.');
    }
    return data as Movimiento[];
  }

  /** Registra un movimiento (el trigger de la BD actualiza el stock del producto) */
  async registrar(documento: DocumentoMovimiento): Promise<void> {
    const { error } = await this.supabase.from('movimientos').insert({ datos: documento });
    if (error) {
      const sinStock = error.message.toLowerCase().includes('stock');
      throw new Error(sinStock ? 'No hay stock suficiente para esa salida.' : 'No se pudo registrar el movimiento.');
    }
  }

  /**
   * Observable que emite cada movimiento NUEVO en tiempo real.
   * Al cancelar la suscripción (unsubscribe) se cierra el canal → sin memory leaks.
   */
  escucharNuevos(): Observable<Movimiento> {
    return new Observable<Movimiento>((suscriptor) => {
      const canal = this.supabase
        .channel(`movimientos-${Date.now()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'movimientos' }, (cambio) =>
          suscriptor.next(cambio.new as Movimiento),
        )
        .subscribe();
      return () => {
        void this.supabase.removeChannel(canal);
      };
    });
  }
}
