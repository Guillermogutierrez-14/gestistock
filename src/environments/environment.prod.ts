import { supabaseEnv } from './env.generated';

/**
 * Configuración del entorno de PRODUCCIÓN (la usa `ng build`).
 * En Vercel, las claves vienen de las Environment Variables del proyecto.
 */
export const environment = {
  production: true,
  ...supabaseEnv,
};