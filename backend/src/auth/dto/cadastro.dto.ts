import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { aparar, normalizarEmail } from '../../comum/transformacoes.js';

export class CadastroDto {
  @Transform(aparar)
  @IsString({ message: 'Informe o nome' })
  @Length(1, 100, { message: 'O nome deve ter entre 1 e 100 caracteres' })
  nome: string;

  @Transform(normalizarEmail)
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @IsString({ message: 'Informe a senha' })
  @Length(8, 72, { message: 'A senha deve ter entre 8 e 72 caracteres' })
  senha: string;
}
