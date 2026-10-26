import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
  IonSpinner, IonText, IonButton, IonIcon, ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cubeOutline, warningOutline, cashOutline, documentTextOutline, downloadOutline } from 'ionicons/icons';
import { ProductoService } from '../../core/services/producto.service';
import { ExportacionService } from '../../core/services/exportacion.service';
import { Producto } from '../../core/models/producto.model';
import { ColumnaTabla, TablaDatosComponent } from '../../shared/components/tabla-datos/tabla-datos.component';
import { WidgetEstadisticaComponent } from '../../shared/components/widget-estadistica/widget-estadistica.component';

/**
 * Página de productos (componente PADRE).
 * Obtiene los datos del servicio y se los pasa a los componentes hijos
 * (tabla y widgets) por inputs; escucha sus outputs para reaccionar.
 */
@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonSpinner, IonText,
    IonButton, IonIcon, CurrencyPipe, TablaDatosComponent, WidgetEstadisticaComponent,
  ],
})
export class ProductosPage implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly toastCtrl = inject(ToastController);
  private readonly exportacion = inject(ExportacionService);
  private readonly destroyRef = inject(DestroyRef);

  /** Estado de la página */
  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly soloStockBajo = signal(false);
  /** Texto del buscador (lo recibimos con el output `busquedaCambiada` de la tabla) */
  readonly busqueda = signal('');

  /** Columnas que se pasan a la tabla reutilizable */
  protected readonly columnas: ColumnaTabla<Producto>[] = [
    { campo: 'codigo', titulo: 'Código' },
    { campo: 'nombre', titulo: 'Nombre' },
    { campo: 'categoria', titulo: 'Categoría' },
    { campo: 'precio', titulo: 'Precio', tipo: 'moneda' },
    { campo: 'stock', titulo: 'Stock', tipo: 'numero' },
  ];

  /** Valores derivados (computed): se recalculan solos cuando cambian los productos */
  protected readonly productosVisibles = computed(() =>
    this.soloStockBajo() ? this.productos().filter((p) => this.tieneStockBajo(p)) : this.productos(),
  );
  /** Lo que se exporta = lo que el usuario ve (filtro de stock bajo + texto del buscador) */
  readonly productosExportables = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.productosVisibles();
    return this.productosVisibles().filter((p) =>
      [p.codigo, p.nombre, p.categoria].some((valor) => valor.toLowerCase().includes(texto)),
    );
  });

  protected readonly totalProductos = computed(() => this.productos().length);
  protected readonly totalStockBajo = computed(() => this.productos().filter((p) => this.tieneStockBajo(p)).length);
  protected readonly valorInventario = computed(() =>
    this.productos().reduce((total, p) => total + p.precio * p.stock, 0),
  );

  constructor() {
    addIcons({ cubeOutline, warningOutline, cashOutline, documentTextOutline, downloadOutline });
  }

  /** Ciclo de vida: al iniciar el componente, cargamos los datos */
  ngOnInit(): void {
    this.cargar();
  }

  /** Pide los productos a la API REST (asíncrono, con Observable) */
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.productoService
      .obtenerTodos()
      .pipe(takeUntilDestroyed(this.destroyRef)) // se cancela solo al destruir la página (evita memory leaks)
      .subscribe({
        next: (productos) => {
          this.productos.set(productos);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los productos. Comprueba tu conexión.');
          this.cargando.set(false);
        },
      });
  }

  /** Reacciona al output `pulsado` de los widgets */
  onWidgetPulsado(titulo: string): void {
    this.soloStockBajo.set(titulo === 'Stock bajo' ? !this.soloStockBajo() : false);
  }

  /** Reacciona al output `filaSeleccionada` de la tabla */
  async mostrarDetalle(producto: Producto): Promise<void> {
    const aviso = this.tieneStockBajo(producto) ? ' ⚠️ Stock bajo' : '';
    const toast = await this.toastCtrl.create({
      message: `${producto.nombre}: ${producto.stock} uds. (mínimo ${producto.stock_minimo})${aviso}`,
      duration: 2500,
      position: 'bottom',
    });
    await toast.present();
  }

  /** Descarga el listado visible en CSV */
  exportarCSV(): void {
    this.exportacion.exportarCSV(this.nombreArchivo(), this.columnas, this.productosExportables());
  }

  /** Descarga el listado visible en PDF, con un resumen arriba */
  async exportarPDF(): Promise<void> {
    const lista = this.productosExportables();
    const valor = lista.reduce((t, p) => t + p.precio * p.stock, 0);
    await this.exportacion.exportarPDF(
      this.soloStockBajo() ? 'Informe de productos con stock bajo' : 'Informe de inventario de productos',
      this.nombreArchivo(),
      this.columnas,
      lista,
      [
        { etiqueta: 'Productos:', valor: String(lista.length) },
        { etiqueta: 'Unidades en stock:', valor: lista.reduce((t, p) => t + p.stock, 0).toLocaleString('es-ES') },
        { etiqueta: 'Valor del inventario:', valor: `${valor.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €` },
        { etiqueta: 'Con stock bajo:', valor: String(lista.filter((p) => this.tieneStockBajo(p)).length) },
      ],
    );
  }

  private nombreArchivo(): string {
    return `gestistock-productos-${new Date().toISOString().slice(0, 10)}`;
  }

  private tieneStockBajo(producto: Producto): boolean {
    return producto.stock <= producto.stock_minimo;
  }
}
