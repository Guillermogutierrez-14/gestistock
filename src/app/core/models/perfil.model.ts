/** Roles disponibles en la aplicación */
export type Rol = 'admin' | 'usuario';

/** Perfil de un usuario (tabla `perfiles` de Supabase) */
export interface Perfil {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}
