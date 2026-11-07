import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InquilinosApi } from '../../core/api';
import { deIso, hojeLocal, paraIso } from '../../core/datas';
import { mensagemDeErro } from '../../core/erros';
import { InquilinoDetalhe } from '../../core/modelos';

/** Registrar saída (RN-10): pede a data e devolve o inquilino atualizado. */
@Component({
  selector: 'q-dialogo-saida',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialogo-cabecalho">
      <span class="dialogo-icone dialogo-icone--perigo" aria-hidden="true">
        <span class="material-symbols-outlined">door_open</span>
      </span>
      <h2 mat-dialog-title>
        Registrar saída<small>{{ inquilino.nome }} · {{ inquilino.imovel.nome }}</small>
      </h2>
    </div>

    <form [formGroup]="form" (ngSubmit)="confirmar()">
      <mat-dialog-content>
        <div class="campo">
          <label for="data-saida">Data de saída</label>
          <mat-form-field>
            <input
              matInput
              id="data-saida"
              [formControl]="data"
              [matDatepicker]="calendario"
              [min]="entrada"
              placeholder="dd/mm/aaaa"
            />
            <mat-datepicker-toggle matIconSuffix [for]="calendario" aria-label="Abrir calendário" />
            <mat-datepicker #calendario />
            @if (data.hasError('matDatepickerMin')) {
              <mat-error>A data de saída não pode ser anterior à entrada.</mat-error>
            } @else if (data.invalid) {
              <mat-error>Informe uma data válida (dd/mm/aaaa).</mat-error>
            }
          </mat-form-field>
        </div>

        <ul class="consequencias">
          <li>O imóvel fica <strong>vago</strong> e pode receber outro inquilino.</li>
          <li>O histórico continua guardado, <strong>inclusive meses em atraso</strong>.</li>
          <li>Meses em aberto que vencem <strong>depois</strong> da saída são removidos.</li>
        </ul>

        @if (erro()) {
          <div class="aviso aviso--erro" role="alert">
            <span class="material-symbols-outlined" aria-hidden="true">error</span>{{ erro() }}
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-flat-button class="botao-claro" type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button class="botao-perigo-forte" type="submit" [disabled]="enviando()">
          <span class="botao-carregando">
            @if (enviando()) {
              <mat-spinner diameter="18" />
            }
            Registrar saída
          </span>
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .consequencias {
      margin: 4px 0 0;
      padding-left: 20px;
      color: var(--q-texto-suave);
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 14px;
    }
    .consequencias strong {
      color: var(--q-texto);
    }
    .aviso {
      margin-top: 12px;
    }
  `,
})
export class DialogoSaida {
  protected readonly inquilino = inject<InquilinoDetalhe>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<DialogoSaida, InquilinoDetalhe>);
  private readonly api = inject(InquilinosApi);

  protected readonly entrada = deIso(this.inquilino.dataEntrada);
  protected readonly data = new FormControl<Date | null>(hojeLocal(), Validators.required);
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
    this.api.registrarSaida(this.inquilino.id, paraIso(data)).subscribe({
      next: (atualizado) => this.ref.close(atualizado),
      error: (e: unknown) => {
        this.erro.set(mensagemDeErro(e));
        this.enviando.set(false);
      },
    });
  }
}
