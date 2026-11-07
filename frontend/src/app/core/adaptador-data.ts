import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

/**
 * O NativeDateAdapter interpreta "10/11/2026" como 11 de outubro (formato americano).
 * Este adaptador lê e exibe sempre `dd/MM/aaaa`.
 */
@Injectable()
export class AdaptadorDataBr extends NativeDateAdapter {
  override parse(valor: unknown): Date | null {
    if (typeof valor !== 'string') return super.parse(valor);
    const texto = valor.trim();
    if (!texto) return null;
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(texto);
    if (!m) return this.invalid();
    const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const data = new Date(ano, mes - 1, dia);
    const valida =
      data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
    return valida ? data : this.invalid();
  }

  override format(data: Date, formato: object): string {
    if (!this.isValid(data)) return '';
    // Formato de exibição do campo: dd/MM/aaaa.
    if ('year' in formato && 'month' in formato && 'day' in formato) {
      const d = String(data.getDate()).padStart(2, '0');
      const m = String(data.getMonth() + 1).padStart(2, '0');
      return `${d}/${m}/${data.getFullYear()}`;
    }
    return super.format(data, formato);
  }
}
