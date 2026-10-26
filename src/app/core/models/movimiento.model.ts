/** Tipo de movimiento de stock */
export type TipoMovimiento = 'entrada' | 'salida';

/**
 * DOCUMENTO JSON guardado en la columna `datos` (JSONB).
 * Es un esquema flexible, estilo NoSQL: además de los campos fijos,
 * cada documento puede llevar campos opcionales distintos (nota, proveedor...).
 */
export interface DocumentoMovimiento {
  tipo: TipoMovimiento;
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  cantidad: number;
  nota?: string;
  proveedor?: string;
}

/** Fila completa de la colección `movimientos` */
export interface Movimiento {
  id: number;
  creado_en: string;
  usuario_email: string;
  datos: DocumentoMovimiento;
}
