import { INestApplication } from '@nestjs/common';
import {
  cliente,
  criarApp,
  emailAleatorio,
  removerContas,
  respostas,
} from './utilitarios.js';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const email = emailAleatorio();

  beforeAll(async () => {
    app = await criarApp();
  });

  afterAll(async () => {
    await removerContas(app, [email]);
    await app.close();
  });

  it('cadastra conta, normaliza o e-mail e devolve token sem senhaHash', async () => {
    const res = await cliente(app).post('/auth/cadastro', {
      nome: '  Ana Teste  ',
      email: `  ${email.toUpperCase()} `,
      senha: 'senha-forte-123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.proprietario).toEqual({
      id: expect.any(String),
      nome: 'Ana Teste',
      email,
    });
  });

  it('e-mail já cadastrado → 409', async () => {
    const res = await cliente(app).post('/auth/cadastro', {
      nome: 'Outra',
      email,
      senha: 'outra-senha-123',
    });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('E-mail já cadastrado');
  });

  it('valida os campos e recusa campos extras, com mensagens em português', async () => {
    const res = await cliente(app).post('/auth/cadastro', {
      nome: 'X',
      email: 'invalido',
      senha: 'curta',
      admin: true,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual(
      expect.arrayContaining([
        'Informe um e-mail válido',
        'A senha deve ter entre 8 e 72 caracteres',
        'O campo admin não é permitido',
      ]),
    );
  });

  it('login certo devolve token; o token acessa /auth/eu', async () => {
    const res = await cliente(app).post('/auth/login', {
      email,
      senha: 'senha-forte-123',
    });
    expect(res.status).toBe(200);
    expect(res.body.proprietario.email).toBe(email);

    const eu = await cliente(app, res.body.token).get('/auth/eu');
    expect(eu.status).toBe(200);
    expect(eu.body).toEqual({
      id: res.body.proprietario.id,
      nome: 'Ana Teste',
      email,
    });
  });

  it('login errado → 401 com a mesma mensagem para senha errada e e-mail inexistente', async () => {
    const senhaErrada = await cliente(app).post('/auth/login', {
      email,
      senha: 'senha-errada-123',
    });
    const semConta = await cliente(app).post('/auth/login', {
      email: emailAleatorio(),
      senha: 'senha-forte-123',
    });
    for (const res of [senhaErrada, semConta]) {
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('E-mail ou senha inválidos');
    }
  });

  it('rota protegida sem token ou com token inválido → 401', async () => {
    for (const rota of ['/auth/eu', '/imoveis', '/inquilinos', '/painel']) {
      expect((await cliente(app).get(rota)).status).toBe(401);
    }
    expect((await cliente(app, 'token-falso').get('/auth/eu')).status).toBe(
      401,
    );
  });

  it('nenhuma resposta contém senhaHash', () => {
    expect(respostas.length).toBeGreaterThan(0);
    for (const corpo of respostas) expect(corpo).not.toContain('senhaHash');
  });
});
