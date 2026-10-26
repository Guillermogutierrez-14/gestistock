import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Crea UNA sola conexión con Supabase para toda la aplicación (patrón Singleton).
 * El resto de servicios la reutilizan inyectando este servicio.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
}
