import { TransformFnParams } from 'class-transformer';

/** Remove espaços das pontas de strings; outros valores passam sem mudança. */
export const aparar = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

/** RN-02: e-mail salvo em minúsculas e sem espaços. */
export const normalizarEmail = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

/** Campo opcional de texto: aparado; string vazia vira null (limpa o campo). */
export const textoOpcional = ({ value }: TransformFnParams): unknown => {
  if (typeof value !== 'string') return value;
  const aparado = value.trim();
  return aparado === '' ? null : aparado;
};
