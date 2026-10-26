import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { ProductoService } from '../services/producto.service';

/**
 * VALIDADOR ASÍNCRONO: comprueba contra la base de datos (API REST de Supabase)
 * si el código de producto ya existe.
 *
 * - timer(400): espera 400 ms desde la última tecla antes de preguntar al servidor
 *   (debounce), para no lanzar una petición por cada letra.
 * - switchMap: si el usuario sigue escribiendo, cancela la petición anterior.
 * - Devuelve { codigoDuplicado: true } si existe, o null si está libre.
 */
export function codigoUnicoValidator(productoService: ProductoService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const codigo = String(control.value ?? '').trim();
    if (!codigo) {
      return of(null);
    }
    return timer(400).pipe(
      switchMap(() => productoService.existeCodigo(codigo)),
      map((existe) => (existe ? { codigoDuplicado: true } : null)),
      // Si falla la red, no bloqueamos el formulario (la BD lo rechazaría igualmente por el UNIQUE)
      catchError(() => of(null)),
    );
  };
}
