import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { aparar, textoOpcional } from '../../comum/transformacoes.js';
import { IsDataISO, IsValorMonetario } from '../../comum/validadores.js';
import { emailOpcional, MENSAGENS, normalizarCpf } from './campos-inquilino.js';

/** RN-09: dados do inquilino ao cadastrar. */
export class CriarInquilinoDto {
  @IsUUID('all', { message: 'Informe o imóvel' })
  imovelId: string;

  @Transform(aparar)
  @IsString({ message: MENSAGENS.nome })
  @Length(1, 100, { message: MENSAGENS.nome })
  nome: string;

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

  @IsValorMonetario({ message: MENSAGENS.valorAluguel })
  valorAluguel: string;

  @IsInt({ message: MENSAGENS.diaVencimento })
  @Min(1, { message: MENSAGENS.diaVencimento })
  @Max(31, { message: MENSAGENS.diaVencimento })
  diaVencimento: number;

  @IsDataISO({ message: MENSAGENS.data })
  dataEntrada: string;
}
