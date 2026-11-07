import { Pipe, PipeTransform } from '@angular/core';
import { competenciaCurta, competenciaLonga, dataBr, diaMes } from '../core/datas';

const MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Valor da API ("1200.00") → "R$ 1.200,00". Number() só para exibir (regra 4). */
@Pipe({ name: 'dinheiro' })
export class DinheiroPipe implements PipeTransform {
  transform(valor: string | number | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') return '';
    return MOEDA.format(Number(valor));
  }
}

/** "2026-10-05" → "05/10/2026" (ou "05/10" com `curta`). */
@Pipe({ name: 'dataBr' })
export class DataBrPipe implements PipeTransform {
  transform(iso: string | null | undefined, curta = false): string {
    if (!iso) return '';
    return curta ? diaMes(iso) : dataBr(iso);
  }
}

/** "2026-10" → "out/2026" (ou "Outubro / 2026" com `longa`). */
@Pipe({ name: 'competencia' })
export class CompetenciaPipe implements PipeTransform {
  transform(competencia: string, longa = false): string {
    return longa ? competenciaLonga(competencia) : competenciaCurta(competencia);
  }
}
