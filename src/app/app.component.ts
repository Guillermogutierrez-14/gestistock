import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote,
  IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline, homeSharp, cubeOutline, cubeSharp, addCircleOutline, addCircleSharp,
  statsChartOutline, statsChartSharp, helpCircleOutline, helpCircleSharp,
} from 'ionicons/icons';

/**
 * Componente raíz de la aplicación.
 * Contiene el menú lateral (Side Menu) y el router-outlet donde se cargan las páginas.
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
  /** Opciones del menú lateral */
  protected readonly appPages = [
    { title: 'Inicio', url: '/inicio', icon: 'home' },
    { title: 'Productos', url: '/productos', icon: 'cube' },
    { title: 'Nuevo producto', url: '/productos/nuevo', icon: 'add-circle' },
    { title: 'Cuadro de mando', url: '/dashboard', icon: 'stats-chart' },
    { title: 'Ayuda', url: '/ayuda', icon: 'help-circle' },
  ];

  constructor() {
    // Registramos solo los iconos que usamos (optimiza el tamaño final)
    addIcons({
      homeOutline, homeSharp, cubeOutline, cubeSharp, addCircleOutline, addCircleSharp,
      statsChartOutline, statsChartSharp, helpCircleOutline, helpCircleSharp,
    });
  }
}