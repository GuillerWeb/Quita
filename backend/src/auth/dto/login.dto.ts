import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { normalizarEmail } from '../../comum/transformacoes.js';

export class LoginDto {
  @Transform(normalizarEmail)
  @IsString({ message: 'Informe o e-mail' })
  @IsNotEmpty({ message: 'Informe o e-mail' })
  email: string;

  @IsString({ message: 'Informe a senha' })
  @IsNotEmpty({ message: 'Informe a senha' })
  senha: string;
}
