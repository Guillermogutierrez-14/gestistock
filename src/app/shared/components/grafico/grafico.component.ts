import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, input, output, viewChild,
} from '@angular/core';
import { Chart, ChartData, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * Componente reutilizable: gráfico de Chart.js.
 * Es AGNÓSTICO: no sabe qué datos pinta. Recibe el tipo y los datos por inputs
 * y emite `elementoPulsado` (índice) cuando el usuario pulsa una barra o porción.
 * Ciclo de vida:
 * - ngAfterViewInit: crea el gráfico cuando el <canvas> ya existe.
 * - effect(): si cambian los datos, actualiza el gráfico (sin recrearlo).
 * - ngOnDestroy: destruye el gráfico para liberar memoria (evita memory leaks).
 */
@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.component.html',
  styleUrls: ['./grafico.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficoComponent implements AfterViewInit, OnDestroy {
  readonly tipo = input.required<ChartType>();
  readonly datos = input.required<ChartData>();
  readonly titulo = input('');
  /** Descripción para lectores de pantalla (el canvas no es accesible por sí solo) */
  readonly descripcion = input('');

  readonly elementoPulsado = output<number>();

  private readonly lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico?: Chart;

  constructor() {
    effect(() => {
      const datos = this.datos();
      if (this.grafico) {
        this.grafico.data = datos;
        this.grafico.update();
      }
    });
  }

  ngAfterViewInit(): void {
    const colorTexto = getComputedStyle(document.body).getPropertyValue('--ion-text-color').trim() || '#666';
    const conEjes = this.tipo() !== 'doughnut' && this.tipo() !== 'pie';
    this.grafico = new Chart(this.lienzo().nativeElement, {
      type: this.tipo(),
      data: this.datos(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        color: colorTexto,
        plugins: { legend: { labels: { color: colorTexto } } },
        scales: conEjes
          ? {
              x: { ticks: { color: colorTexto } },
              y: { ticks: { color: colorTexto }, beginAtZero: true },
            }
          : undefined,
        onClick: (_evento, elementos) => {
          if (elementos.length > 0) {
            this.elementoPulsado.emit(elementos[0].index);
          }
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.grafico?.destroy();
  }
}
