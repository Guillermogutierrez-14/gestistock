import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';
import { ColumnaTabla } from '../../shared/components/tabla-datos/tabla-datos.component';

/** Línea de resumen que aparece encima de la tabla del PDF (ej. "Valor total: 1.234,00 €") */
export interface ResumenInforme {
  etiqueta: string;
  valor: string;
}

/**
 * Servicio de exportación de informes tabulados.
 * - CSV: separador ";" y BOM UTF-8 para que Excel en español lo abra bien (tildes y decimales con coma).
 * - PDF: jsPDF + jspdf-autotable con cabecera corporativa, resumen, tabla con estilo y nº de página.
 *   Las librerías de PDF se cargan con import() dinámico: solo se descargan cuando se pulsa "Exportar PDF".
 */
@Injectable({ providedIn: 'root' })
export class ExportacionService {
  /** Genera el texto CSV (público para poder probarlo con tests) */
  generarCSV<T extends object>(columnas: ColumnaTabla<T>[], filas: T[]): string {
    const cabecera = columnas.map((c) => this.escaparCSV(c.titulo)).join(';');
    const lineas = filas.map((fila) =>
      columnas.map((c) => this.escaparCSV(this.formatearCSV(fila[c.campo], c.tipo))).join(';'),
    );
    return [cabecera, ...lineas].join('\r\n');
  }

  exportarCSV<T extends object>(nombreArchivo: string, columnas: ColumnaTabla<T>[], filas: T[]): void {
    const contenido = '﻿' + this.generarCSV(columnas, filas); // BOM → Excel detecta UTF-8
    this.descargar(new Blob([contenido], { type: 'text/csv;charset=utf-8' }), `${nombreArchivo}.csv`);
  }

  async exportarPDF<T extends object>(
    titulo: string,
    nombreArchivo: string,
    columnas: ColumnaTabla<T>[],
    filas: T[],
    resumen: ResumenInforme[] = [],
  ): Promise<void> {
    // Carga diferida de las librerías (no aumentan la carga inicial de la app)
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);

    const doc = new jsPDF({ orientation: 'landscape' });
    const ancho = doc.internal.pageSize.getWidth();
    const alto = doc.internal.pageSize.getHeight();
    const azul: [number, number, number] = [56, 128, 255];

    // Cabecera corporativa
    doc.setFillColor(...azul);
    doc.rect(0, 0, ancho, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('GestiStock', 14, 14);
    doc.setFontSize(10);
    doc.text('Sistema de gestión de inventario', ancho - 14, 14, { align: 'right' });

    // Título y fecha
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.text(titulo, 14, 34);
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(`Generado el ${new Date().toLocaleString('es-ES')} · ${filas.length} registros`, 14, 40);

    let y = 46;
    if (resumen.length > 0) {
      autoTable(doc, {
        startY: y,
        body: resumen.map((r) => [r.etiqueta, r.valor]),
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1.5 },
        columnStyles: { 0: { fontStyle: 'bold' } },
        tableWidth: 120,
      });
      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    }

    // Columnas numéricas alineadas a la derecha
    const estilosColumnas: Record<number, { halign: 'right' }> = {};
    columnas.forEach((c, i) => {
      if (c.tipo === 'numero' || c.tipo === 'moneda') estilosColumnas[i] = { halign: 'right' };
    });

    autoTable(doc, {
      startY: y,
      head: [columnas.map((c) => c.titulo)],
      body: filas.map((fila) => columnas.map((c) => this.formatearPDF(fila[c.campo], c.tipo))),
      theme: 'striped',
      headStyles: { fillColor: azul, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: estilosColumnas,
      margin: { left: 14, right: 14 },
    });

    // Pie de página: "Página X de Y"
    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Página ${i} de ${totalPaginas}`, ancho - 14, alto - 8, { align: 'right' });
      doc.text('Datos sintéticos generados para fines académicos', 14, alto - 8);
    }

    doc.save(`${nombreArchivo}.pdf`);
  }

  private formatearCSV(valor: unknown, tipo?: ColumnaTabla<object>['tipo']): string {
    if (typeof valor === 'number' && tipo === 'moneda') return valor.toFixed(2).replace('.', ',');
    if (typeof valor === 'number') return String(valor).replace('.', ',');
    return String(valor ?? '');
  }

  private formatearPDF(valor: unknown, tipo?: ColumnaTabla<object>['tipo']): string {
    if (typeof valor === 'number' && tipo === 'moneda') {
      return `${valor.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    }
    if (typeof valor === 'number') return valor.toLocaleString('es-ES');
    return String(valor ?? '');
  }

  /** Si el texto tiene ; " o saltos de línea, se rodea de comillas (formato CSV estándar) */
  private escaparCSV(texto: string): string {
    return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  }

  private descargar(blob: Blob, nombreArchivo: string): void {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
