import { Component, inject } from '@angular/core';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge,
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

/** Página de bienvenida: muestra el nombre y el rol del usuario conectado. */
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge,
  ],
})
export class InicioPage {
  protected readonly auth = inject(AuthService);
}
