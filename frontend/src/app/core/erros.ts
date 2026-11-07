import { HttpErrorResponse } from '@angular/common/http';

/** Mensagem em português para mostrar ao usuário a partir de um erro da API. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) {
      return 'Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.';
    }
    if (erro.status === 429) {
      return 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.';
    }
    const mensagem = (erro.error as { message?: unknown } | null)?.message;
    if (Array.isArray(mensagem)) return mensagem.join(' ');
    if (typeof mensagem === 'string' && mensagem) return mensagem;
    if (erro.status >= 500) return 'O servidor teve um problema. Tente novamente em instantes.';
  }
  return 'Algo deu errado. Tente novamente.';
}

export function statusDoErro(erro: unknown): number | null {
  return erro instanceof HttpErrorResponse ? erro.status : null;
}
