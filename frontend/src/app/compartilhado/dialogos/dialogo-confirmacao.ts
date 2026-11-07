import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface DadosConfirmacao {
  titulo: string;
  mensagem: string;
  confirmar: string;
  icone?: string;
  perigo?: boolean;
}

/** Confirmação de ações destrutivas (excluir, desfazer). Fecha com `true` ao confirmar. */
@Component({
  selector: 'q-dialogo-confirmacao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="dialogo-cabecalho">
      <span class="dialogo-icone" [class.dialogo-icone--perigo]="dados.perigo" aria-hidden="true">
        <span class="material-symbols-outlined">{{ dados.icone ?? 'help' }}</span>
      </span>
      <h2 mat-dialog-title>{{ dados.titulo }}</h2>
    </div>
    <mat-dialog-content>
      <p class="dialogo-texto">{{ dados.mensagem }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button class="botao-claro" type="button" [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button type="button" [class.botao-perigo-forte]="dados.perigo" [mat-dialog-close]="true" cdkFocusInitial>
        {{ dados.confirmar }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DialogoConfirmacao {
  protected readonly dados = inject<DadosConfirmacao>(MAT_DIALOG_DATA);
}
