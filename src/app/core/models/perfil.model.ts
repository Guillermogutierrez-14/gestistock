/** Roles disponibles en la aplicación (UA: asignación usuario → rol en la tabla `perfiles`) */
export type Rol = 'admin' | 'usuario';

/** Permisos con formato `recurso:acción`. Las vistas preguntan por permisos, no por roles. */
export type Permiso =
  | 'productos:leer'
  | 'productos:crear'
  | 'movimientos:leer'
  | 'movimientos:registrar'
  | 'informes:exportar'
  | 'dashboard:ver';

/**
 * Matriz RBAC (PA: asignación permiso → rol).
 * Añadir un rol nuevo = añadir una entrada aquí, sin tocar guards ni vistas.
 */
export const PERMISOS_POR_ROL: Readonly<Record<Rol, readonly Permiso[]>> = {
  usuario: ['productos:leer', 'movimientos:leer', 'movimientos:registrar', 'informes:exportar'],
  admin: [
    'productos:leer', 'productos:crear', 'movimientos:leer', 'movimientos:registrar',
    'informes:exportar', 'dashboard:ver',
  ],
};

/** Claims del JWT de Supabase que usa la interfaz (la firma la verifica el servidor) */
export interface ClaimsToken {
  /** Id del usuario */
  sub: string;
  email?: string;
  /** Expiración en segundos Unix */
  exp: number;
  /** Rol de PostgreSQL (siempre `authenticated`), no el rol de negocio */
  role?: string;
}

/** Perfil de un usuario (tabla `perfiles` de Supabase) */
export interface Perfil {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}
