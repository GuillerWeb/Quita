import { registerDecorator, ValidationOptions } from 'class-validator';
import { dataValida } from './datas.js';

/** Data real no formato `YYYY-MM-DD`. */
export function IsDataISO(opcoes?: ValidationOptions) {
  return (alvo: object, propriedade: string) =>
    registerDecorator({
      name: 'isDataISO',
      target: alvo.constructor,
      propertyName: propriedade,
      options: opcoes,
      validator: {
        validate: (valor: unknown) =>
          typeof valor === 'string' && dataValida(valor),
      },
    });
}

// Decimal(10, 2): até 8 dígitos inteiros e 2 casas; precisa ser maior que zero.
const VALOR_MONETARIO = /^\d{1,8}(\.\d{1,2})?$/;

/** Valor em dinheiro como string decimal positiva, ex.: `"1200.00"` (regra 4). */
export function IsValorMonetario(opcoes?: ValidationOptions) {
  return (alvo: object, propriedade: string) =>
    registerDecorator({
      name: 'isValorMonetario',
      target: alvo.constructor,
      propertyName: propriedade,
      options: opcoes,
      validator: {
        validate: (valor: unknown) =>
          typeof valor === 'string' &&
          VALOR_MONETARIO.test(valor) &&
          /[1-9]/.test(valor),
      },
    });
}
