import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CadastroDto } from './dto/cadastro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VerificadorEmailService } from './verificador-email.service.js';

const CUSTO_BCRYPT = 10;
// Hash usado quando o e-mail não existe, para o login levar o mesmo tempo nos dois casos.
const HASH_FALSO = bcrypt.hashSync('senha-que-nao-existe', CUSTO_BCRYPT);

export interface ProprietarioPublico {
  id: string;
  nome: string;
  email: string;
}

export interface RespostaAuth {
  token: string;
  proprietario: ProprietarioPublico;
}

/** Campos que podem sair na API (RN-03: nunca o senhaHash). */
const CAMPOS_PUBLICOS = { id: true, nome: true, email: true } as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly verificadorEmail: VerificadorEmailService,
  ) {}

  async cadastrar(dto: CadastroDto): Promise<RespostaAuth> {
    const existente = await this.prisma.proprietario.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existente) throw new ConflictException('E-mail já cadastrado');

    // D-22: domínio inexistente ou sem MX → 400 (em falha de DNS, aceita).
    await this.verificadorEmail.garantirDominioComMx(dto.email);

    const senhaHash = await bcrypt.hash(dto.senha, CUSTO_BCRYPT);
    try {
      const proprietario = await this.prisma.proprietario.create({
        data: { nome: dto.nome, email: dto.email, senhaHash },
        select: CAMPOS_PUBLICOS,
      });
      return this.resposta(proprietario);
    } catch (erro) {
      // Corrida entre dois cadastros com o mesmo e-mail.
      if ((erro as { code?: string }).code === 'P2002') {
        throw new ConflictException('E-mail já cadastrado');
      }
      throw erro;
    }
  }

  async entrar(dto: LoginDto): Promise<RespostaAuth> {
    const proprietario = await this.prisma.proprietario.findUnique({
      where: { email: dto.email },
    });
    const senhaOk = await bcrypt.compare(
      dto.senha,
      proprietario?.senhaHash ?? HASH_FALSO,
    );
    if (!proprietario || !senhaOk) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }
    const { id, nome, email } = proprietario;
    return this.resposta({ id, nome, email });
  }

  async eu(proprietarioId: string): Promise<ProprietarioPublico> {
    const proprietario = await this.prisma.proprietario.findUnique({
      where: { id: proprietarioId },
      select: CAMPOS_PUBLICOS,
    });
    if (!proprietario) throw new NotFoundException('Conta não encontrada');
    return proprietario;
  }

  private async resposta(
    proprietario: ProprietarioPublico,
  ): Promise<RespostaAuth> {
    const token = await this.jwt.signAsync({
      sub: proprietario.id,
      email: proprietario.email,
    });
    return { token, proprietario };
  }
}
