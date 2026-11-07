import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PagamentosApi } from '../../core/api';
import { hojeLocal, paraIso } from '../../core/datas';
import { mensagemDeErro } from '../../core/erros';
import { Pagamento } from '../../core/modelos';
import { CompetenciaPipe, DinheiroPipe } from '../formatos';

export interface DadosPagamento {
  pagamento: Pagamento;
  nome: string;
  imovel: string;
}

/** Diálogo "Confirmar quitação": data do pagamento (padrão hoje, sem datas futuras). */
@Component({
  selector: 'q-dialogo-pagamento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DinheiroPipe,
    CompetenciaPipe,
  ],
  template: `
    <div class="dialogo-cabecalho">
      <span class="dialogo-icone" aria-hidden="true"><span class="material-symbols-outlined">verified</span></span>
      <h2 mat-dialog-title>Confirmar pagamento do aluguel<small>Registro no histórico do inquilino</small></h2>
    </div>

    <form [formGroup]="form" (ngSubmit)="confirmar()">
      <mat-dialog-content>
        <dl class="resumo-dialogo">
          <div><dt>Inquilino:</dt><dd>{{ dados.nome }}</dd></div>
          <div><dt>Imóvel:</dt><dd>{{ dados.imovel }}</dd></div>
          <div>
            <dt>Competência:</dt>
            <dd class="competencia">{{ dados.pagamento.competencia | competencia: true }}</dd>
          </div>
          <div class="valor-destaque">
            <dt>Valor a quitar:</dt>
            <dd>{{ dados.pagamento.valor | dinheiro }}</dd>
          </div>
        </dl>

        <div class="campo">
          <label for="data-pagamento">Data do pagamento</label>
          <mat-form-field>
            <input matInput id="data-pagamento" [formControl]="data" [matDatepicker]="calendario" [max]="hoje"
                   placeholder="dd/mm/aaaa" aria-describedby="dica-data" />
            <mat-datepicker-toggle matIconSuffix [for]="calendario" aria-label="Abrir calendário" />
            <mat-datepicker #calendario />
            @if (data.hasError('required') || data.hasError('matDatepickerParse')) {
              <mat-error>Informe uma data válida (dd/mm/aaaa).</mat-error>
            } @else if (data.hasError('matDatepickerMax')) {
              <mat-error>A data de pagamento não pode ser futura.</mat-error>
            }
          </mat-form-field>
          <span class="dica" id="dica-data">Preenchido com a data de hoje. Altere se o pagamento foi em outro dia.</span>
        </div>

        @if (erro()) {
          <div class="aviso aviso--erro" role="alert">
            <span class="material-symbols-outlined" aria-hidden="true">error</span>{{ erro() }}
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-flat-button class="botao-claro" type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="enviando()">
          <span class="botao-carregando">
            @if (enviando()) {
              <mat-spinner diameter="18" />
            } @else {
              <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
            }
            Confirmar pagamento
          </span>
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .competencia { color: var(--q-aguardando); }
    .aviso { margin-top: 12px; }
  `,
})
export class DialogoPagamento {
  protected readonly dados = inject<DadosPagamento>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<DialogoPagamento, Pagamento>);
  private readonly api = inject(PagamentosApi);

  protected readonly hoje = hojeLocal();
  protected readonly data = new FormControl<Date | null>(this.hoje, Validators.required);
  protected readonly form = new FormGroup({ data: this.data });
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  protected confirmar(): void {
    const data = this.data.value;
    if (this.data.invalid || !data) {
      this.data.markAsTouched();
      return;
    }
    this.enviando.set(true);
    this.erro.set('');
    this.api.pagar(this.dados.pagamento.id, paraIso(data)).subscribe({
      next: (pagamento) => this.ref.close(pagamento),
      error: (e: unknown) => {
        this.erro.set(mensagemDeErro(e));
        this.enviando.set(false);
      },
    });
  }
}
