import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonInput, IonInputPasswordToggle, IonButton, IonSpinner, IonText,
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

/**
 * Página de inicio de sesión (Vista + ViewModel en MVVM).
 * Usa un formulario reactivo con validaciones; la lógica de autenticación
 * está en AuthService (Modelo), no en el componente.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent, IonInput, IonInputPasswordToggle, IonButton,
    IonSpinner, IonText,
  ],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Formulario reactivo con sus validaciones */
  readonly formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /** Estado de la vista */
  readonly cargando = signal(false);
  readonly mensajeError = signal<string | null>(null);

  /** Se ejecuta al enviar el formulario */
  async iniciarSesion(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched(); // muestra los mensajes de error
      return;
    }
    this.cargando.set(true);
    this.mensajeError.set(null);
    const { email, password } = this.formulario.getRawValue();
    try {
      await this.auth.login(email, password);
      await this.router.navigateByUrl('/inicio', { replaceUrl: true });
    } catch (error) {
      this.mensajeError.set(error instanceof Error ? error.message : 'Error inesperado.');
    } finally {
      this.cargando.set(false);
    }
  }
}
