import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import {
  DadosConfirmacao,
  DialogoConfirmacao,
} from '../../compartilhado/dialogos/dialogo-confirmacao';
import { Notificacao } from '../../compartilhado/notificacao.service';
import { ImoveisApi } from '../../core/api';
import { mensagemDeErro } from '../../core/erros';

/** Cadastro (`/imoveis/novo`) e edição (`/imoveis/:id/editar`) de imóvel. */
@Component({
  selector: 'q-formulario-imovel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="pagina pagina--estreita">
      <header class="pagina-cabecalho">
        <div class="pagina-cabecalho__titulo">
          <h1 class="titulo-pagina">{{ id() ? 'Editar imóvel' : 'Cadastrar imóvel' }}</h1>
        </div>
        <p>Cada espaço alugado é um imóvel: casa, apartamento, sala ou quarto.</p>
      </header>

      @if (carregando()) {
        <div class="carregando-pagina">
          <mat-spinner diameter="40" aria-label="Carregando imóvel" />
        </div>
      } @else {
        <form
          class="cartao cartao--preenchido formulario"
          [formGroup]="form"
          (ngSubmit)="salvar()"
          novalidate
        >
          <div class="campo">
            <label for="nome">Nome ou identificação</label>
            <mat-form-field>
              <input
                matInput
                id="nome"
                formControlName="nome"
                placeholder="Ex.: Casa 2 — Rua das Acácias"
              />
              @if (form.controls.nome.hasError('required')) {
                <mat-error>Informe o nome do imóvel.</mat-error>
              } @else if (form.controls.nome.hasError('maxlength')) {
                <mat-error>Use no máximo 100 caracteres.</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="campo">
            <label for="endereco">Endereço <span class="opcional">(opcional)</span></label>
            <mat-form-field>
              <input
                matInput
                id="endereco"
                formControlName="endereco"
                placeholder="Rua, número, bairro, cidade"
              />
              @if (form.controls.endereco.hasError('maxlength')) {
                <mat-error>Use no máximo 200 caracteres.</mat-error>
              }
            </mat-form-field>
          </div>

          @if (erro()) {
            <div class="aviso aviso--erro" role="alert">
              <span class="material-symbols-outlined" aria-hidden="true">error</span>{{ erro() }}
            </div>
          }

          <div class="acoes-formulario" [class.acoes-formulario--separadas]="id()">
            @if (id()) {
              <button
                mat-button
                class="botao-perigo"
                type="button"
                (click)="excluir()"
                [disabled]="enviando()"
              >
                <span class="botao-carregando"
                  ><span class="material-symbols-outlined" aria-hidden="true">delete</span>Excluir
                  imóvel</span
                >
              </button>
            }
            <div class="acoes-formulario">
              <a mat-flat-button class="botao-claro" routerLink="/imoveis">Cancelar</a>
              <button mat-flat-button type="submit" [disabled]="enviando()">
                <span class="botao-carregando">
                  @if (enviando()) {
                    <mat-spinner diameter="18" />
                  }
                  {{ id() ? 'Salvar alterações' : 'Cadastrar imóvel' }}
                </span>
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    .opcional {
      font-weight: 400;
      color: var(--q-texto-suave);
    }
    .acoes-formulario .acoes-formulario {
      padding-top: 0;
    }
  `,
})
export class FormularioImovel implements OnInit {
  /** Vem da rota `/imoveis/:id/editar` (vazio no cadastro). */
  readonly id = input<string>();

  private readonly api = inject(ImoveisApi);
  private readonly router = inject(Router);
  private readonly dialogo = inject(MatDialog);
  private readonly notificacao = inject(Notificacao);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    endereco: ['', Validators.maxLength(200)],
  });
  protected readonly carregando = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    this.carregando.set(true);
    this.api.buscar(id).subscribe({
      next: (imovel) => {
        this.form.setValue({ nome: imovel.nome, endereco: imovel.endereco ?? '' });
        this.carregando.set(false);
      },
      error: (e: unknown) => {
        this.notificacao.erro(e);
        void this.router.navigate(['/imoveis']);
      },
    });
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nome, endereco } = this.form.getRawValue();
    const dados = { nome: nome.trim(), endereco: endereco.trim() || null };
    const id = this.id();
    this.enviando.set(true);
    this.erro.set('');
    (id ? this.api.atualizar(id, dados) : this.api.criar(dados)).subscribe({
      next: () => {
        this.notificacao.sucesso(id ? 'Imóvel atualizado' : 'Imóvel cadastrado');
        void this.router.navigate(['/imoveis']);
      },
      error: (e: unknown) => {
        this.erro.set(mensagemDeErro(e));
        this.enviando.set(false);
      },
    });
  }

  protected excluir(): void {
    const id = this.id();
    if (!id) return;
    const dados: DadosConfirmacao = {
      titulo: 'Excluir imóvel?',
      mensagem:
        'Use esta opção só para corrigir um cadastro feito por engano. Imóveis que já tiveram inquilino não podem ser excluídos.',
      confirmar: 'Excluir',
      icone: 'delete',
      perigo: true,
    };
    this.dialogo
      .open(DialogoConfirmacao, { data: dados, width: '440px', maxWidth: 'calc(100vw - 32px)' })
      .afterClosed()
      .subscribe((confirmou?: boolean) => {
        if (!confirmou) return;
        this.enviando.set(true);
        this.api.excluir(id).subscribe({
          next: () => {
            this.notificacao.sucesso('Imóvel excluído');
            void this.router.navigate(['/imoveis']);
          },
          error: (e: unknown) => {
            this.erro.set(mensagemDeErro(e));
            this.enviando.set(false);
          },
        });
      });
  }
}
