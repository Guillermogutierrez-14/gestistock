import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote,
  IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline, homeSharp, cubeOutline, cubeSharp, addCircleOutline, addCircleSharp,
  statsChartOutline, statsChartSharp, helpCircleOutline, helpCircleSharp,
  logOutOutline, logOutSharp, swapHorizontalOutline, swapHorizontalSharp,
} from 'ionicons/icons';
import { AuthService } from './core/services/auth.service';

/** Opción del menú lateral */
interface OpcionMenu {
  title: string;
  url: string;
  icon: string;
  /** Si es true, solo la ve el administrador */
  soloAdmin: boolean;
}

/**
 * Componente raíz de la aplicación.
 * Contiene el menú lateral (Side Menu), que muestra unas opciones u otras
 * según el rol del usuario, y el router-outlet donde se cargan las páginas.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList,
    IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet,
  ],
})
export class AppComponent {
  protected readonly auth = inject(AuthService);

  /** Todas las opciones del menú */
  private readonly opciones: OpcionMenu[] = [
    { title: 'Inicio', url: '/inicio', icon: 'home', soloAdmin: false },
    { title: 'Productos', url: '/productos', icon: 'cube', soloAdmin: false },
    { title: 'Movimientos', url: '/movimientos', icon: 'swap-horizontal', soloAdmin: false },
    { title: 'Nuevo producto', url: '/productos/nuevo', icon: 'add-circle', soloAdmin: true },
    { title: 'Cuadro de mando', url: '/dashboard', icon: 'stats-chart', soloAdmin: true },
    { title: 'Ayuda', url: '/ayuda', icon: 'help-circle', soloAdmin: false },
  ];

  /** Opciones visibles: se recalculan solas cuando cambia el rol (Signal computed) */
  protected readonly paginasVisibles = computed(() =>
    this.opciones.filter((opcion) => !opcion.soloAdmin || this.auth.esAdmin()),
  );

  constructor() {
    // Registramos solo los iconos que usamos (optimiza el tamaño final)
    addIcons({
      homeOutline, homeSharp, cubeOutline, cubeSharp, addCircleOutline, addCircleSharp,
      statsChartOutline, statsChartSharp, helpCircleOutline, helpCircleSharp,
      logOutOutline, logOutSharp, swapHorizontalOutline, swapHorizontalSharp,
    });
  }

  /** Cierra la sesión del usuario */
  protected cerrarSesion(): void {
    void this.auth.logout();
  }
}
