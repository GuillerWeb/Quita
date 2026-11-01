import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configurarApp } from '../src/configurar-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

/** Corpos de todas as respostas, para conferir que nenhuma traz `senhaHash`. */
export const respostas: string[] = [];

export async function criarApp(): Promise<INestApplication> {
  const modulo = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = modulo.createNestApplication();
  configurarApp(app);
  await app.init();
  return app;
}

type Metodo = 'get' | 'post' | 'patch' | 'delete';

/** Cliente HTTP autenticado (ou não) que registra os corpos das respostas. */
export function cliente(app: INestApplication, token?: string) {
  const chamar = async (metodo: Metodo, url: string, corpo?: object) => {
    let req = request(app.getHttpServer())[metodo](url);
    if (token) req = req.set('Authorization', `Bearer ${token}`);
    const res = corpo ? await req.send(corpo) : await req;
    respostas.push(res.text ?? '');
    return res;
  };
  return {
    get: (url: string) => chamar('get', url),
    post: (url: string, corpo?: object) => chamar('post', url, corpo),
    patch: (url: string, corpo?: object) => chamar('patch', url, corpo),
    delete: (url: string) => chamar('delete', url),
  };
}

export const emailAleatorio = () => `teste-${randomUUID()}@exemplo.com`;

export interface Conta {
  id: string;
  email: string;
  token: string;
  api: ReturnType<typeof cliente>;
}

export async function cadastrarConta(app: INestApplication): Promise<Conta> {
  const email = emailAleatorio();
  const res = await cliente(app).post('/auth/cadastro', {
    nome: 'Proprietário de Teste',
    email,
    senha: 'senha-de-teste-123',
  });
  if (res.status !== 201) {
    throw new Error(`Cadastro falhou: ${res.status} ${res.text}`);
  }
  const { token, proprietario } = res.body;
  return { id: proprietario.id, email, token, api: cliente(app, token) };
}

/** Remove tudo o que as contas de teste criaram, na ordem das chaves estrangeiras. */
export async function removerContas(
  app: INestApplication,
  emails: string[],
): Promise<void> {
  const prisma = app.get(PrismaService);
  const contas = await prisma.proprietario.findMany({
    where: { email: { in: emails } },
    select: { id: true },
  });
  const ids = contas.map((c) => c.id);
  const filtro = { where: { proprietarioId: { in: ids } } };
  await prisma.pagamento.deleteMany(filtro);
  await prisma.inquilino.deleteMany(filtro);
  await prisma.imovel.deleteMany(filtro);
  await prisma.proprietario.deleteMany({ where: { id: { in: ids } } });
}

/** Desloca `YYYY-MM-DD` em meses, mantendo o dia (usado só com dias ≤ 28). */
export function somarMeses(data: string, meses: number): string {
  const [ano, mes, dia] = data.split('-').map(Number);
  const total = ano * 12 + (mes - 1) + meses;
  const novoAno = Math.floor(total / 12);
  const novoMes = (total % 12) + 1;
  return `${novoAno}-${String(novoMes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}
