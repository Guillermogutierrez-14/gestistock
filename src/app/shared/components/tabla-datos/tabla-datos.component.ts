import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { IonSearchbar } from '@ionic/angular';

/** Definición de una columna de la tabla */
export interface ColumnaTabla<T> {
  /** Propiedad del objeto que se muestra en la columna */
  campo: keyof T & string;
  /** Texto de la cabecera */
  titulo: string;
  /** Formato del valor (por defecto, texto) */
  tipo?: 'texto' | 'numero' | 'moneda';
}

/**
 * Componente reutilizable: tabla de datos con buscador.
 * Es AGNÓSTICO: no sabe qué datos muestra (usa un tipo genérico T).
 * - Recibe los datos y las columnas por inputs.
 * - Notifica al padre con outputs cuando se selecciona una fila o cambia la búsqueda.
 * - OnPush: solo se vuelve a renderizar cuando cambian sus inputs o signals.
 */
@Component({
  selector: 'app-tabla-datos',
  templateUrl: './tabla-datos.component.html',
  styleUrls: ['./tabla-datos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonSearchbar, CurrencyPipe, DecimalPipe],
})
export class TablaDatosComponent<T extends object> {
  /** INPUTS: datos que recibe del componente padre */
  readonly datos = input.required<T[]>();
  readonly columnas = input.required<ColumnaTabla<T>[]>();
  readonly titulo = input('Tabla de datos');
  readonly placeholderBusqueda = input('Buscar...');

  /** OUTPUTS: eventos que emite hacia el componente padre */
  readonly filaSeleccionada = output<T>();
  readonly busquedaCambiada = output<string>();

  /** Estado interno: texto del buscador */
  protected readonly textoBusqueda = signal('');

  /** Filas que coinciden con la búsqueda (se recalcula solo cuando cambia algo) */
  protected readonly datosFiltrados = computed(() => {
    const texto = this.textoBusqueda().trim().toLowerCase();
    if (!texto) {
      return this.datos();
    }
    return this.datos().filter((fila) =>
      this.columnas().some((col) => String(fila[col.campo] ?? '').toLowerCase().includes(texto)),
    );
  });

  /** Se ejecuta al escribir en el buscador */
  onBuscar(evento: CustomEvent<{ value?: string | null }>): void {
    const texto = evento.detail.value ?? '';
    this.textoBusqueda.set(texto);
    this.busquedaCambiada.emit(texto);
  }

  /** Se ejecuta al hacer clic (o pulsar Enter/Espacio) en una fila */
  seleccionar(fila: T): void {
    this.filaSeleccionada.emit(fila);
  }

  protected valor(fila: T, columna: ColumnaTabla<T>): unknown {
    return fila[columna.campo];
  }

  protected esNumerica(columna: ColumnaTabla<T>): boolean {
    return columna.tipo === 'numero' || columna.tipo === 'moneda';
  }
}
