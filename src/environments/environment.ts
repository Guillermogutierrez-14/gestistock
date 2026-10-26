   import { supabaseEnv } from './env.generated';

   /**
    * Configuración del entorno de DESARROLLO.
    * Las claves de Supabase vienen de env.generated.ts (generado desde .env, no se sube a Git).
    */
   export const environment = {
     production: false,
     ...supabaseEnv,
   };