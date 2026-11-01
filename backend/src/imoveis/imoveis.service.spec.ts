import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ImoveisService } from './imoveis.service.js';

function criarServico() {
  const prisma = {
    imovel: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    inquilino: { count: vi.fn() },
  };
  return {
    servico: new ImoveisService(prisma as unknown as PrismaService),
    prisma,
  };
}

const imovel = { id: 'i1', nome: 'Casa 1', endereco: null, inquilinos: [] };

describe('ImoveisService', () => {
  it('sempre filtra por proprietarioId ao buscar', async () => {
    const { servico, prisma } = criarServico();
    prisma.imovel.findFirst.mockResolvedValue(imovel);
    await servico.buscar('p1', 'i1');
    expect(prisma.imovel.findFirst.mock.calls[0][0].where).toEqual({
      id: 'i1',
      proprietarioId: 'p1',
    });
  });

  it('imóvel de outro proprietário → 404', async () => {
    const { servico, prisma } = criarServico();
    prisma.imovel.findFirst.mockResolvedValue(null);
    await expect(servico.buscar('p2', 'i1')).rejects.toThrow(
      new NotFoundException('Imóvel não encontrado'),
    );
  });

  it('marca vago (inquilinoAtivo null) ou devolve o inquilino ativo', async () => {
    const { servico, prisma } = criarServico();
    prisma.imovel.findMany.mockResolvedValue([
      imovel,
      { ...imovel, id: 'i2', inquilinos: [{ id: 'q1', nome: 'João' }] },
    ]);
    const lista = await servico.listar('p1');
    expect(lista[0].inquilinoAtivo).toBeNull();
    expect(lista[1].inquilinoAtivo).toEqual({ id: 'q1', nome: 'João' });
  });

  it('RN-08: imóvel com histórico de inquilinos não pode ser excluído', async () => {
    const { servico, prisma } = criarServico();
    prisma.imovel.findFirst.mockResolvedValue(imovel);
    prisma.inquilino.count.mockResolvedValue(1);
    await expect(servico.excluir('p1', 'i1')).rejects.toThrow(
      ConflictException,
    );
    expect(prisma.imovel.delete).not.toHaveBeenCalled();
  });

  it('exclui imóvel que nunca teve inquilino', async () => {
    const { servico, prisma } = criarServico();
    prisma.imovel.findFirst.mockResolvedValue(imovel);
    prisma.inquilino.count.mockResolvedValue(0);
    await servico.excluir('p1', 'i1');
    expect(prisma.imovel.delete).toHaveBeenCalledWith({
      where: { id: 'i1', proprietarioId: 'p1' },
    });
  });
});
