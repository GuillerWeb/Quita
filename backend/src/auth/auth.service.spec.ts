import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

function criarServico() {
  const prisma = {
    proprietario: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };
  const jwt = new JwtService({ secret: 'segredo-de-teste' });
  const servico = new AuthService(
    prisma as unknown as PrismaService,
    jwt,
  );
  return { servico, prisma, jwt };
}

describe('AuthService', () => {
  it('cadastra, guarda só o hash da senha e devolve token sem senhaHash', async () => {
    const { servico, prisma, jwt } = criarServico();
    prisma.proprietario.findUnique.mockResolvedValue(null);
    prisma.proprietario.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'p1', nome: data.nome, email: data.email }),
    );

    const resposta = await servico.cadastrar({
      nome: 'Ana',
      email: 'ana@exemplo.com',
      senha: 'senha-forte',
    });

    const dados = prisma.proprietario.create.mock.calls[0][0].data;
    expect(dados.senha).toBeUndefined();
    expect(await bcrypt.compare('senha-forte', dados.senhaHash)).toBe(true);
    expect(resposta.proprietario).toEqual({
      id: 'p1',
      nome: 'Ana',
      email: 'ana@exemplo.com',
    });
    expect(JSON.stringify(resposta)).not.toContain('senhaHash');
    const payload = await jwt.verifyAsync(resposta.token);
    expect(payload).toMatchObject({ sub: 'p1', email: 'ana@exemplo.com' });
  });

  it('e-mail já cadastrado → 409', async () => {
    const { servico, prisma } = criarServico();
    prisma.proprietario.findUnique.mockResolvedValue({ id: 'p1' });
    await expect(
      servico.cadastrar({ nome: 'Ana', email: 'a@b.com', senha: '12345678' }),
    ).rejects.toThrow(new ConflictException('E-mail já cadastrado'));
  });

  it('login com e-mail inexistente e com senha errada dão a mesma mensagem', async () => {
    const { servico, prisma } = criarServico();
    const erro = new UnauthorizedException('E-mail ou senha inválidos');

    prisma.proprietario.findUnique.mockResolvedValue(null);
    await expect(
      servico.entrar({ email: 'x@b.com', senha: '12345678' }),
    ).rejects.toThrow(erro);

    prisma.proprietario.findUnique.mockResolvedValue({
      id: 'p1',
      nome: 'Ana',
      email: 'a@b.com',
      senhaHash: await bcrypt.hash('certa-123', 4),
    });
    await expect(
      servico.entrar({ email: 'a@b.com', senha: 'errada-123' }),
    ).rejects.toThrow(erro);
  });

  it('login certo devolve o proprietário sem senhaHash', async () => {
    const { servico, prisma } = criarServico();
    prisma.proprietario.findUnique.mockResolvedValue({
      id: 'p1',
      nome: 'Ana',
      email: 'a@b.com',
      senhaHash: await bcrypt.hash('certa-123', 4),
    });
    const resposta = await servico.entrar({
      email: 'a@b.com',
      senha: 'certa-123',
    });
    expect(resposta.proprietario).toEqual({
      id: 'p1',
      nome: 'Ana',
      email: 'a@b.com',
    });
  });
});
