// Contratos da API (docs/build/01-backend.md). Dinheiro chega como string ("1200.00")
// e datas como "YYYY-MM-DD"; competência como "YYYY-MM".

export interface Proprietario {
  id: string;
  nome: string;
  email: string;
}

export interface RespostaAuth {
  token: string;
  proprietario: Proprietario;
}

export interface Imovel {
  id: string;
  nome: string;
  endereco: string | null;
  inquilinoAtivo: { id: string; nome: string } | null;
}

export interface DadosImovel {
  nome: string;
  endereco?: string | null;
}

export type Situacao = 'PAGO' | 'AGUARDANDO' | 'ATRASADO';

export interface Pagamento {
  id: string;
  inquilinoId: string;
  competencia: string;
  valor: string;
  dataVencimento: string;
  status: 'AGUARDANDO' | 'PAGO';
  situacao: Situacao;
  dataPagamento: string | null;
}

export interface Inquilino {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  observacoes: string | null;
  valorAluguel: string;
  diaVencimento: number;
  dataEntrada: string;
  dataSaida: string | null;
  ativo: boolean;
  imovel: { id: string; nome: string };
}

export interface InquilinoDaLista extends Inquilino {
  mesesAtrasados: number;
}

export interface InquilinoDetalhe extends Inquilino {
  pagamentos: Pagamento[];
  resumo: { mesesAtrasados: number; valorDevido: string };
}

export interface DadosInquilino {
  imovelId?: string;
  nome?: string;
  telefone?: string | null;
  email?: string | null;
  cpf?: string | null;
  observacoes?: string | null;
  valorAluguel?: string;
  diaVencimento?: number;
  dataEntrada?: string;
}

export interface AtrasadoDoPainel {
  inquilinoId: string;
  nome: string;
  imovel: string;
  meses: number;
  valorDevido: string;
  pagamentos: Pagamento[];
}

export interface PagamentoDoPainel extends Pagamento {
  nome: string;
  imovel: string;
}

export interface Painel {
  competencia: string;
  hoje: string;
  totais: { esperado: string; recebido: string; aguardando: string };
  atrasados: AtrasadoDoPainel[];
  aVencer: PagamentoDoPainel[];
  imoveisVagos: { id: string; nome: string }[];
}
