import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular';

/** Lo implementan las páginas con formularios que no deben abandonarse a medias */
export interface ConCambiosSinGuardar {
  tieneCambiosSinGuardar(): boolean;
}

/**
 * canDeactivate: si el formulario tiene cambios sin guardar, pide confirmación
 * con un ion-alert antes de salir de la página.
 */
export const cambiosSinGuardarGuard: CanDeactivateFn<ConCambiosSinGuardar> = async (componente) => {
  if (!componente.tieneCambiosSinGuardar()) {
    return true;
  }
  const alerta = await inject(AlertController).create({
    header: 'Cambios sin guardar',
    message: 'Si sales ahora perderás los datos del formulario. ¿Quieres salir?',
    buttons: [
      { text: 'Quedarme', role: 'cancel' },
      { text: 'Salir', role: 'confirm' },
    ],
  });
  await alerta.present();
  const { role } = await alerta.onDidDismiss();
  return role === 'confirm';
};
