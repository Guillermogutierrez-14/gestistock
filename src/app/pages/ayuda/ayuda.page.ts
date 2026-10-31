import { Component, inject } from '@angular/core';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
  IonAccordionGroup, IonAccordion, IonItem, IonLabel,
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

/** Sección de la ayuda */
interface SeccionAyuda {
  titulo: string;
  pasos: string[];
  /** Si es true, solo se muestra al administrador */
  soloAdmin?: boolean;
}

/**
 * Página de Ayuda integrada (manual de usuario dentro de la app).
 * Muestra solo las secciones que el rol del usuario puede usar.
 */
@Component({
  selector: 'app-ayuda',
  templateUrl: './ayuda.page.html',
  styleUrls: ['./ayuda.page.scss'],
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
    IonAccordionGroup, IonAccordion, IonItem, IonLabel,
  ],
})
export class AyudaPage {
  protected readonly auth = inject(AuthService);

  private readonly secciones: SeccionAyuda[] = [
    {
      titulo: 'Iniciar y cerrar sesión',
      pasos: [
        'Escribe tu email y tu contraseña y pulsa «Entrar».',
        'Si la sesión caduca, la app te pedirá entrar de nuevo y te devolverá a la página donde estabas.',
        'Para salir, abre el menú lateral y pulsa «Cerrar sesión».',
      ],
    },
    {
      titulo: 'Consultar el inventario (Productos)',
      pasos: [
        'Las tarjetas superiores muestran el total de productos, los que tienen stock bajo y el valor del inventario.',
        'Escribe en el buscador para filtrar por código, nombre o categoría.',
        'Pulsa la tarjeta «Stock bajo» para ver solo los productos por debajo del mínimo.',
      ],
    },
    {
      titulo: 'Exportar informes (PDF y CSV)',
      pasos: [
        'En Productos, pulsa «Exportar CSV» para abrir los datos en Excel.',
        'Pulsa «Exportar PDF» para descargar un informe con formato.',
        'Se exportan solo los productos que coinciden con la búsqueda actual.',
      ],
    },
    {
      titulo: 'Movimientos de stock en tiempo real',
      pasos: [
        'En Movimientos verás las entradas y salidas de stock; la lista se actualiza sola.',
        'Rellena el formulario para registrar una entrada o una salida.',
      ],
    },
    {
      titulo: 'Dar de alta un producto',
      soloAdmin: true,
      pasos: [
        'Pulsa «Nuevo producto» en el menú o en la cabecera de Productos.',
        'El código debe tener el formato ABC-123 y no puede repetirse (se comprueba al escribir).',
        'Si sales con datos sin guardar, la app te pedirá confirmación.',
      ],
    },
    {
      titulo: 'Cuadro de mando',
      soloAdmin: true,
      pasos: [
        'Muestra gráficos del stock por categoría y de los movimientos.',
        'Usa los filtros para cambiar los datos; los gráficos se actualizan en tiempo real.',
      ],
    },
  ];

  /** Secciones visibles según el rol */
  protected get seccionesVisibles(): SeccionAyuda[] {
    return this.secciones.filter((s) => !s.soloAdmin || this.auth.esAdmin());
  }
}
