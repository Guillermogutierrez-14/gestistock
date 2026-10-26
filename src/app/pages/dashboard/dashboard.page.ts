import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChartData } from 'chart.js';
import { forkJoin, from } from 'rxjs';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonSegment,
  IonSegmentButton, IonLabel, IonSpinner, IonText, IonButton,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cubeOutline, layersOutline, cashOutline, warningOutline } from 'ionicons/icons';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { Producto } from '../../core/models/producto.model';
import { Movimiento } from '../../core/models/movimiento.model';
import { GraficoComponent } from '../../shared/components/grafico/grafico.component';
import { WidgetEstadisticaComponent } from '../../shared/components/widget-estadistica/widget-estadistica.component';

const TODAS = 'Todas';
const COLORES = ['#4C8DFF', '#2DD36F', '#FFC409', '#EB445A', '#8E6CEF', '#3DC2FF'];

/**
 * Cuadro de mando (solo administrador).
 * - Carga productos (SQL) y movimientos (NoSQL) EN PARALELO con forkJoin.
 * - Todos los datos de los gráficos son `computed`: al cambiar el filtro o llegar
 *   un movimiento en tiempo real, se recalculan y los gráficos se actualizan solos.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    CurrencyPipe, DecimalPipe, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
    IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonText, IonButton, GraficoComponent,
    WidgetEstadisticaComponent,
  ],
})
export class DashboardPage implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly destroyRef = inject(DestroyRef);

  /** Estado */
  readonly productos = signal<Producto[]>([]);
  readonly movimientos = signal<Movimiento[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly categoriaSeleccionada = signal<string>(TODAS);

  /** Lista de categorías existentes */
  readonly categorias = computed(() => [...new Set(this.productos().map((p) => p.categoria))].sort());

  /** FILTRO EN TIEMPO REAL: productos de la categoría elegida */
  readonly productosFiltrados = computed(() => {
    const categoria = this.categoriaSeleccionada();
    return categoria === TODAS ? this.productos() : this.productos().filter((p) => p.categoria === categoria);
  });

  /** Movimientos de la categoría elegida (se cruza con los productos por su id) */
  readonly movimientosFiltrados = computed(() => {
    const ids = new Set(this.productosFiltrados().map((p) => p.id));
    return this.movimientos().filter((m) => ids.has(m.datos.producto_id));
  });

  /** Indicadores (widgets) */
  readonly totalProductos = computed(() => this.productosFiltrados().length);
  readonly totalUnidades = computed(() => this.productosFiltrados().reduce((t, p) => t + p.stock, 0));
  readonly valorInventario = computed(() => this.productosFiltrados().reduce((t, p) => t + p.precio * p.stock, 0));
  readonly totalStockBajo = computed(() => this.productosFiltrados().filter((p) => p.stock <= p.stock_minimo).length);

  /** Gráfico 1 (doughnut): unidades en stock por categoría (siempre todas, para poder elegir) */
  readonly datosCategorias = computed<ChartData>(() => {
    const categorias = this.categorias();
    return {
      labels: categorias,
      datasets: [
        {
          label: 'Unidades',
          data: categorias.map((c) =>
            this.productos().filter((p) => p.categoria === c).reduce((t, p) => t + p.stock, 0),
          ),
          backgroundColor: categorias.map((_, i) => COLORES[i % COLORES.length]),
        },
      ],
    };
  });

  /** Gráfico 2 (barras): stock actual vs stock mínimo de cada producto filtrado */
  readonly datosStock = computed<ChartData>(() => {
    const lista = [...this.productosFiltrados()].sort((a, b) => a.codigo.localeCompare(b.codigo));
    return {
      labels: lista.map((p) => p.codigo),
      datasets: [
        { label: 'Stock actual', data: lista.map((p) => p.stock), backgroundColor: COLORES[0] },
        { label: 'Stock mínimo', data: lista.map((p) => p.stock_minimo), backgroundColor: COLORES[3] },
      ],
    };
  });

  /** Gráfico 3 (líneas): unidades que entran y salen cada día (últimos 7 días) */
  readonly datosMovimientos = computed<ChartData>(() => {
    const dias: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      dias.push(this.claveDia(fecha));
    }
    const sumar = (tipo: 'entrada' | 'salida') =>
      dias.map((dia) =>
        this.movimientosFiltrados()
          .filter((m) => m.datos.tipo === tipo && this.claveDia(new Date(m.creado_en)) === dia)
          .reduce((t, m) => t + m.datos.cantidad, 0),
      );
    return {
      labels: dias,
      datasets: [
        { label: 'Entradas', data: sumar('entrada'), borderColor: COLORES[1], backgroundColor: COLORES[1], tension: 0.3 },
        { label: 'Salidas', data: sumar('salida'), borderColor: COLORES[3], backgroundColor: COLORES[3], tension: 0.3 },
      ],
    };
  });

  constructor() {
    addIcons({ cubeOutline, layersOutline, cashOutline, warningOutline });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.escucharTiempoReal();
  }

  /** Orquestación asíncrona: las dos fuentes de datos A LA VEZ */
  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      productos: this.productoService.obtenerTodos(),
      movimientos: from(this.movimientoService.obtenerRecientes(500)),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ productos, movimientos }) => {
          this.productos.set(productos);
          this.movimientos.set(movimientos);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los datos del cuadro de mando.');
          this.cargando.set(false);
        },
      });
  }

  /** Cambia el filtro desde el selector de categorías */
  cambiarCategoria(categoria: string | number | undefined): void {
    this.categoriaSeleccionada.set(String(categoria ?? TODAS));
  }

  /** Output del gráfico doughnut: al pulsar una porción se filtra por esa categoría (y se quita si ya estaba) */
  onCategoriaPulsada(indice: number): void {
    const categoria = this.categorias()[indice];
    this.categoriaSeleccionada.set(this.categoriaSeleccionada() === categoria ? TODAS : categoria);
  }

  /** TIEMPO REAL: los gráficos se actualizan solos cuando llega un movimiento */
  private escucharTiempoReal(): void {
    this.movimientoService
      .escucharNuevos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nuevo) => {
        this.movimientos.update((lista) => [nuevo, ...lista]);
        const signo = nuevo.datos.tipo === 'entrada' ? 1 : -1;
        this.productos.update((lista) =>
          lista.map((p) => (p.id === nuevo.datos.producto_id ? { ...p, stock: p.stock + signo * nuevo.datos.cantidad } : p)),
        );
      });
  }

  private claveDia(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }
}
