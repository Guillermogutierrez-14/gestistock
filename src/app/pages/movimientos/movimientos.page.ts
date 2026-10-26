import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, from } from 'rxjs';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonList, IonItem,
  IonLabel, IonBadge, IonNote, IonSelect, IonSelectOption, IonSegment, IonSegmentButton,
  IonInput, IonButton, IonSpinner, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  ToastController,
} from '@ionic/angular';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { Producto } from '../../core/models/producto.model';
import { Movimiento, TipoMovimiento } from '../../core/models/movimiento.model';

/**
 * Página de movimientos de stock.
 * - Carga productos (API REST, SQL) y movimientos (documentos JSON, NoSQL) EN PARALELO con forkJoin.
 * - Se suscribe a los movimientos nuevos en TIEMPO REAL.
 * - Permite registrar entradas y salidas.
 */
@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  styleUrls: ['./movimientos.page.scss'],
  imports: [
    ReactiveFormsModule, DatePipe, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonBadge, IonNote, IonSelect, IonSelectOption,
    IonSegment, IonSegmentButton, IonInput, IonButton, IonSpinner, IonText, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent,
  ],
})
export class MovimientosPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly toastCtrl = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);

  /** Estado */
  readonly productos = signal<Producto[]>([]);
  readonly movimientos = signal<Movimiento[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  /** id del último movimiento recibido en directo (para resaltarlo) */
  readonly ultimoEnDirecto = signal<number | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    tipo: ['salida' as TipoMovimiento, Validators.required],
    productoId: [0, [Validators.required, Validators.min(1)]],
    cantidad: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    nota: ['', Validators.maxLength(120)],
  });

  ngOnInit(): void {
    this.cargarDatos();
    this.escucharTiempoReal();
  }

  /**
   * ORQUESTACIÓN ASÍNCRONA: las dos fuentes se piden A LA VEZ con forkJoin
   * (SQL por HttpClient + NoSQL por el cliente de Supabase) y se espera a que terminen ambas.
   */
  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      productos: this.productoService.obtenerTodos(),
      movimientos: from(this.movimientoService.obtenerRecientes()),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ productos, movimientos }) => {
          this.productos.set(productos);
          this.movimientos.set(movimientos);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los datos. Comprueba tu conexión.');
          this.cargando.set(false);
        },
      });
  }

  /** TIEMPO REAL: cada movimiento nuevo (de cualquier usuario) se añade arriba al instante */
  private escucharTiempoReal(): void {
    this.movimientoService
      .escucharNuevos()
      .pipe(takeUntilDestroyed(this.destroyRef)) // al salir de la página se cierra el WebSocket
      .subscribe((nuevo) => {
        if (this.movimientos().some((m) => m.id === nuevo.id)) return;
        this.movimientos.update((lista) => [nuevo, ...lista].slice(0, 50));
        this.ultimoEnDirecto.set(nuevo.id);
        this.actualizarStockLocal(nuevo);
      });
  }

  async registrar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { tipo, productoId, cantidad, nota } = this.formulario.getRawValue();
    const producto = this.productos().find((p) => p.id === Number(productoId));
    if (!producto) return;

    this.guardando.set(true);
    try {
      await this.movimientoService.registrar({
        tipo,
        producto_id: producto.id,
        producto_codigo: producto.codigo,
        producto_nombre: producto.nombre,
        cantidad: Number(cantidad),
        ...(nota.trim() ? { nota: nota.trim() } : {}),
      });
      await this.avisar(`Movimiento registrado: ${tipo} de ${cantidad} uds. de ${producto.nombre}.`, 'success');
      this.formulario.patchValue({ cantidad: 1, nota: '' });
    } catch (e) {
      await this.avisar(e instanceof Error ? e.message : 'Error inesperado.', 'danger');
    } finally {
      this.guardando.set(false);
    }
  }

  /** Mantiene el stock mostrado en el desplegable al día cuando llega un movimiento */
  private actualizarStockLocal(movimiento: Movimiento): void {
    const signo = movimiento.datos.tipo === 'entrada' ? 1 : -1;
    this.productos.update((lista) =>
      lista.map((p) =>
        p.id === movimiento.datos.producto_id ? { ...p, stock: p.stock + signo * movimiento.datos.cantidad } : p,
      ),
    );
  }

  private async avisar(mensaje: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2500, color });
    await toast.present();
  }
}
