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
import { Permiso } from './core/models/perfil.model';

/** Opción del menú lateral */
interface OpcionMenu {
  title: string;
  url: string;
  icon: string;
  /** Permiso necesario para ver la opción (sin permiso = la ve cualquier usuario con sesión) */
  permiso?: Permiso;
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
    { title: 'Inicio', url: '/inicio', icon: 'home' },
    { title: 'Productos', url: '/productos', icon: 'cube', permiso: 'productos:leer' },
    { title: 'Movimientos', url: '/movimientos', icon: 'swap-horizontal', permiso: 'movimientos:leer' },
    { title: 'Nuevo producto', url: '/productos/nuevo', icon: 'add-circle', permiso: 'productos:crear' },
    { title: 'Cuadro de mando', url: '/dashboard', icon: 'stats-chart', permiso: 'dashboard:ver' },
    { title: 'Ayuda', url: '/ayuda', icon: 'help-circle' },
  ];

  /** Opciones visibles: se recalculan solas cuando cambian los permisos (Signal computed) */
  protected readonly paginasVisibles = computed(() =>
    this.opciones.filter((opcion) => !opcion.permiso || this.auth.tienePermiso(opcion.permiso)),
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
