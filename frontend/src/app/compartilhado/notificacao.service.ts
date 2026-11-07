import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensagemDeErro } from '../core/erros';

/** Avisos curtos no rodapé da tela ("Pagamento registrado", erros da API). */
@Injectable({ providedIn: 'root' })
export class Notificacao {
  private readonly snackBar = inject(MatSnackBar);

  sucesso(mensagem: string): void {
    this.snackBar.open(mensagem, 'OK', { panelClass: 'aviso-sucesso' });
  }

  erro(erro: unknown): void {
    const mensagem = typeof erro === 'string' ? erro : mensagemDeErro(erro);
    this.snackBar.open(mensagem, 'Fechar', { duration: 7000, panelClass: 'aviso-erro' });
  }
}
