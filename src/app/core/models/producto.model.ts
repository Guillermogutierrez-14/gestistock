/** Producto del inventario (tabla `productos` de Supabase / PostgreSQL) */
export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  creado_en: string;
}

/** Datos necesarios para dar de alta un producto (el id y la fecha los pone la base de datos) */
export type NuevoProducto = Omit<Producto, 'id' | 'creado_en'>;
