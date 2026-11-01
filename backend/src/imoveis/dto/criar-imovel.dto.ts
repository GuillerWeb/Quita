import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { aparar, textoOpcional } from '../../comum/transformacoes.js';

export class CriarImovelDto {
  @Transform(aparar)
  @IsString({ message: 'Informe o nome do imóvel' })
  @Length(1, 100, { message: 'O nome deve ter entre 1 e 100 caracteres' })
  nome: string;

  @Transform(textoOpcional)
  @IsOptional()
  @IsString({ message: 'Endereço inválido' })
  @MaxLength(200, { message: 'O endereço deve ter no máximo 200 caracteres' })
  endereco?: string | null;
}
