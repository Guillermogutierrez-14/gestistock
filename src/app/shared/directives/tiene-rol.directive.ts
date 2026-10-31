import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { Rol } from '../../core/models/perfil.model';
import { AuthService } from '../../core/services/auth.service';

/**
 * Directiva estructural RBAC: `*appTieneRol="'admin'"`.
 * Si el rol no coincide, el elemento NO se crea en el DOM (no basta con ocultarlo):
 * no se puede reactivar desde las herramientas del navegador ni lo anuncia un lector de pantalla.
 */
@Directive({ selector: '[appTieneRol]' })
export class TieneRolDirective {
  private readonly auth = inject(AuthService);
  private readonly plantilla = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly contenedor = inject(ViewContainerRef);

  readonly appTieneRol = input.required<Rol | Rol[]>();
  private visible = false;

  constructor() {
    // Reactivo: se re-evalúa solo si cambia el rol (login, logout)
    effect(() => {
      const valor = this.appTieneRol();
      const permitido = this.auth.tieneRol(...(Array.isArray(valor) ? valor : [valor]));
      if (permitido && !this.visible) {
        this.contenedor.createEmbeddedView(this.plantilla);
        this.visible = true;
      } else if (!permitido && this.visible) {
        this.contenedor.clear();
        this.visible = false;
      }
    });
  }
}
