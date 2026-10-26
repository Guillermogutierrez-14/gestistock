import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';

/** Colores disponibles (los del tema de Ionic) */
export type ColorWidget = 'primary' | 'success' | 'warning' | 'danger' | 'medium';

/**
 * Componente reutilizable: tarjeta con una estadística (número + título).
 * Es AGNÓSTICO: no sabe de dónde salen los datos; los recibe por inputs
 * y avisa al padre con el output `pulsado` cuando el usuario lo selecciona.
 */
@Component({
  selector: 'app-widget-estadistica',
  templateUrl: './widget-estadistica.component.html',
  styleUrls: ['./widget-estadistica.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon],
})
export class WidgetEstadisticaComponent {
  /** INPUTS */
  readonly titulo = input.required<string>();
  readonly valor = input.required<string | number>();
  readonly icono = input('stats-chart-outline');
  readonly color = input<ColorWidget>('primary');
  readonly descripcion = input('');
  /** Marca el widget como seleccionado (por ejemplo, cuando actúa como filtro) */
  readonly activo = input(false);

  /** OUTPUT: avisa al padre de que se ha pulsado (envía el título) */
  readonly pulsado = output<string>();

  pulsar(): void {
    this.pulsado.emit(this.titulo());
  }
}
