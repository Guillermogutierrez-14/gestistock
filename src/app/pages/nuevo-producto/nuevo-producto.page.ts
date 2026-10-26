import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonInput,
  IonSelect, IonSelectOption, IonButton, IonSpinner, IonText, IonToggle, IonCard,
  IonCardContent, ToastController,
} from '@ionic/angular';
import { ProductoService } from '../../core/services/producto.service';
import { NuevoProducto } from '../../core/models/producto.model';
import { codigoUnicoValidator } from '../../core/validators/codigo-unico.validator';

/** Campos del formulario (para los mensajes de error) */
type Campo = 'codigo' | 'nombre' | 'categoria' | 'precio' | 'stock' | 'stock_minimo';

/**
 * Página de alta de productos (solo administrador).
 * - Formulario REACTIVO con validaciones síncronas y una ASÍNCRONA (código único).
 * - Binding unidireccional: vista previa del valor total.
 * - Binding bidireccional [(ngModel)]: interruptor "seguir añadiendo".
 */
@Component({
  selector: 'app-nuevo-producto',
  templateUrl: './nuevo-producto.page.html',
  styleUrls: ['./nuevo-producto.page.scss'],
  imports: [
    ReactiveFormsModule, FormsModule, CurrencyPipe, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonMenuButton, IonInput, IonSelect, IonSelectOption, IonButton, IonSpinner, IonText,
    IonToggle, IonCard, IonCardContent,
  ],
})
export class NuevoProductoPage {
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly toastCtrl = inject(ToastController);
  private readonly router = inject(Router);

  readonly categorias = ['Informática', 'Oficina', 'Redes', 'Almacén'];

  /** Formulario reactivo: [valor inicial, validadores síncronos, validadores asíncronos] */
  readonly formulario = this.fb.nonNullable.group({
    codigo: [
      '',
      [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{3}$/)],
      [codigoUnicoValidator(this.productoService)],
    ],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    categoria: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    stock_minimo: [5, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
  });

  /** Binding bidireccional con [(ngModel)] */
  seguirAnadiendo = false;

  /** Estado de la vista */
  readonly guardando = signal(false);
  readonly mensajeError = signal<string | null>(null);

  /** Valores del formulario como signal → vista previa que se actualiza sola */
  private readonly valores = toSignal(this.formulario.valueChanges, {
    initialValue: this.formulario.getRawValue(),
  });
  readonly valorTotal = computed(() => {
    const { precio, stock } = this.valores();
    return (Number(precio) || 0) * (Number(stock) || 0);
  });

  /** Mensaje de error de cada campo según el validador que falla */
  mensaje(campo: Campo): string {
    const errores = this.formulario.controls[campo].errors;
    if (!errores) return '';
    if (errores['required']) return 'Este campo es obligatorio.';
    if (errores['codigoDuplicado']) return 'Ese código ya existe en el inventario.';
    if (errores['pattern']) {
      return campo === 'codigo' ? 'Formato: 3 letras mayúsculas, guion y 3 números (ej. INF-006).' : 'Debe ser un número entero.';
    }
    if (errores['minlength']) return `Mínimo ${errores['minlength'].requiredLength} caracteres.`;
    if (errores['maxlength']) return `Máximo ${errores['maxlength'].requiredLength} caracteres.`;
    if (errores['min']) return 'No puede ser negativo.';
    return 'Valor no válido.';
  }

  /** true mientras se está ejecutando la validación asíncrona del código */
  get comprobandoCodigo(): boolean {
    return this.formulario.controls.codigo.pending;
  }

  /** Pasa el código a mayúsculas mientras se escribe */
  aMayusculas(): void {
    const control = this.formulario.controls.codigo;
    const valor = control.value.toUpperCase();
    if (valor !== control.value) {
      control.setValue(valor);
    }
  }

  async guardar(): Promise<void> {
    if (this.formulario.invalid || this.formulario.pending) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.mensajeError.set(null);

    const valores = this.formulario.getRawValue();
    const producto: NuevoProducto = {
      ...valores,
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      stock_minimo: Number(valores.stock_minimo),
    };

    this.productoService.crear(producto).subscribe({
      next: async (creado) => {
        this.guardando.set(false);
        const toast = await this.toastCtrl.create({
          message: `Producto "${creado.nombre}" creado correctamente.`,
          duration: 2500,
          color: 'success',
        });
        await toast.present();
        if (this.seguirAnadiendo) {
          this.formulario.reset();
        } else {
          await this.router.navigateByUrl('/productos');
        }
      },
      error: () => {
        this.guardando.set(false);
        this.mensajeError.set('No se pudo guardar el producto. Inténtalo de nuevo.');
      },
    });
  }
}
