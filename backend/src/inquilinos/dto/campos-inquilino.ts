import { TransformFnParams } from 'class-transformer';

/** CPF aceito com ou sem máscara; salva só os dígitos. Vazio limpa o campo. */
export const normalizarCpf = ({ value }: TransformFnParams): unknown => {
  if (typeof value !== 'string') return value;
  const aparado = value.trim();
  if (aparado === '') return null;
  // Só remove a máscara se não houver letras; senão deixa falhar na validação.
  return /^[\d.\-\s]+$/.test(aparado) ? aparado.replace(/\D/g, '') : aparado;
};

/** E-mail opcional: minúsculas, sem espaços; vazio limpa o campo. */
export const emailOpcional = ({ value }: TransformFnParams): unknown => {
  if (typeof value !== 'string') return value;
  const aparado = value.trim().toLowerCase();
  return aparado === '' ? null : aparado;
};

export const MENSAGENS = {
  nome: 'O nome deve ter entre 1 e 100 caracteres',
  telefone: 'O telefone deve ter no máximo 20 caracteres',
  email: 'Informe um e-mail válido',
  cpf: 'O CPF deve ter 11 dígitos',
  observacoes: 'As observações devem ter no máximo 500 caracteres',
  valorAluguel:
    'O valor do aluguel deve ser maior que zero, com até 2 casas decimais (ex.: "1200.00")',
  diaVencimento: 'O dia de vencimento deve ser um número inteiro de 1 a 31',
  data: 'Informe uma data válida no formato AAAA-MM-DD',
  inicioCobranca:
    'O início da cobrança deve ser MES_SEGUINTE ou MES_DA_ENTRADA',
} as const;

/** RN-18: valores aceitos para o início da cobrança. */
export const INICIOS_COBRANCA = ['MES_SEGUINTE', 'MES_DA_ENTRADA'] as const;
