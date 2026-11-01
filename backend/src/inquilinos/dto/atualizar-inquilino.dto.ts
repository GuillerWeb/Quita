import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { aparar, textoOpcional } from '../../comum/transformacoes.js';
import { IsValorMonetario } from '../../comum/validadores.js';
import { emailOpcional, MENSAGENS, normalizarCpf } from './campos-inquilino.js';

const informado = (_o: object, valor: unknown) => valor !== undefined;

/**
 * Edição do inquilino. `imovelId` e `dataEntrada` não existem aqui (RN-11): enviar
 * esses campos dá 400. Valor e vencimento novos valem só para meses ainda não gerados (RN-12).
 */
export class AtualizarInquilinoDto {
  @Transform(aparar)
  @ValidateIf(informado)
  @IsString({ message: MENSAGENS.nome })
  @Length(1, 100, { message: MENSAGENS.nome })
  nome?: string;

  @Transform(textoOpcional)
  @IsOptional()
  @IsString({ message: MENSAGENS.telefone })
  @MaxLength(20, { message: MENSAGENS.telefone })
  telefone?: string | null;

  @Transform(emailOpcional)
  @IsOptional()
  @IsEmail({}, { message: MENSAGENS.email })
  email?: string | null;

  @Transform(normalizarCpf)
  @IsOptional()
  @Matches(/^\d{11}$/, { message: MENSAGENS.cpf })
  cpf?: string | null;

  @Transform(textoOpcional)
  @IsOptional()
  @IsString({ message: MENSAGENS.observacoes })
  @MaxLength(500, { message: MENSAGENS.observacoes })
  observacoes?: string | null;

  @ValidateIf(informado)
  @IsValorMonetario({ message: MENSAGENS.valorAluguel })
  valorAluguel?: string;

  @ValidateIf(informado)
  @IsInt({ message: MENSAGENS.diaVencimento })
  @Min(1, { message: MENSAGENS.diaVencimento })
  @Max(31, { message: MENSAGENS.diaVencimento })
  diaVencimento?: number;
}
