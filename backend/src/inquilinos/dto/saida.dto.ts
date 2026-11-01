import { IsDataISO } from '../../comum/validadores.js';
import { MENSAGENS } from './campos-inquilino.js';

export class SaidaDto {
  @IsDataISO({ message: MENSAGENS.data })
  dataSaida: string;
}
