import { IsOptional } from 'class-validator';
import { IsDataISO } from '../../comum/validadores.js';

export class PagarDto {
  /** Padrão: hoje (RN-22). */
  @IsOptional()
  @IsDataISO({ message: 'Informe uma data válida no formato AAAA-MM-DD' })
  dataPagamento?: string;
}
