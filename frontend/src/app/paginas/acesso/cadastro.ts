import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { mensagemDeErro, statusDoErro } from '../../core/erros';
import { LayoutAcesso } from './layout-acesso';

/** Confirmação precisa ser igual ao campo "senha" do mesmo formulário. */
function igualASenha(controle: AbstractControl): ValidationErrors | null {
  const senha = controle.parent?.get('senha')?.value;
  return controle.value && senha !== controle.value ? { diferente: true } : null;
}

@Component({
  selector: 'q-cadastro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LayoutAcesso,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <q-layout-acesso>
      <header class="cabecalho">
        <h1>Criar conta</h1>
        <p>Comece a organizar os aluguéis dos seus imóveis com a clareza do livro-caixa.</p>
      </header>

      <form class="formulario" [formGroup]="form" (ngSubmit)="cadastrar()" novalidate>
        <div class="campo">
          <label for="nome">Nome completo</label>
          <mat-form-field>
            <input
              matInput
              id="nome"
              formControlName="nome"
              autocomplete="name"
              placeholder="Seu nome"
            />
            @if (form.controls.nome.hasError('required')) {
              <mat-error>Informe seu nome.</mat-error>
            } @else if (form.controls.nome.hasError('maxlength')) {
              <mat-error>Use no máximo 100 caracteres.</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="campo">
          <label for="email">E-mail</label>
          <mat-form-field>
            <input
              matInput
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              placeholder="seu@email.com.br"
            />
            @if (form.controls.email.hasError('required')) {
              <mat-error>Informe o e-mail.</mat-error>
            } @else if (form.controls.email.hasError('email')) {
              <mat-error>Informe um e-mail válido.</mat-error>
            } @else if (form.controls.email.hasError('jaCadastrado')) {
              <mat-error>Este e-mail já está cadastrado.</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="campo">
          <label for="senha">Senha</label>
          <mat-form-field>
            <input
              matInput
              id="senha"
              [type]="senhaVisivel() ? 'text' : 'password'"
              formControlName="senha"
              autocomplete="new-password"
              placeholder="Crie uma senha forte"
              aria-describedby="dica-senha"
            />
            <button
              mat-icon-button
              matSuffix
              type="button"
              class="botao-olho"
              (click)="senhaVisivel.set(!senhaVisivel())"
              [attr.aria-label]="senhaVisivel() ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <span class="material-symbols-outlined">{{
                senhaVisivel() ? 'visibility_off' : 'visibility'
              }}</span>
            </button>
            @if (form.controls.senha.hasError('required')) {
              <mat-error>Crie uma senha.</mat-error>
            } @else if (form.controls.senha.hasError('minlength')) {
              <mat-error>A senha precisa ter pelo menos 8 caracteres.</mat-error>
            } @else if (form.controls.senha.hasError('maxlength')) {
              <mat-error>A senha pode ter no máximo 72 caracteres.</mat-error>
            }
          </mat-form-field>
          <span class="dica" id="dica-senha">Mínimo de 8 caracteres</span>
        </div>

        <div class="campo">
          <label for="confirmacao">Confirmar senha</label>
          <mat-form-field>
            <input
              matInput
              id="confirmacao"
              [type]="senhaVisivel() ? 'text' : 'password'"
              formControlName="confirmacao"
              autocomplete="new-password"
              placeholder="Repita a senha"
            />
            @if (form.controls.confirmacao.hasError('required')) {
              <mat-error>Repita a senha.</mat-error>
            } @else if (form.controls.confirmacao.hasError('diferente')) {
              <mat-error>As senhas não são iguais.</mat-error>
            }
          </mat-form-field>
        </div>

        @if (erro()) {
          <div class="aviso aviso--erro" role="alert">
            <span class="material-symbols-outlined" aria-hidden="true">error</span>
            {{ erro() }}
          </div>
        }

        <button mat-flat-button class="botao-largo" type="submit" [disabled]="enviando()">
          @if (enviando()) {
            <span class="botao-carregando"><mat-spinner diameter="20" />Criando conta…</span>
          } @else {
            <span class="botao-carregando"
              >Criar conta
              <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></span
            >
          }
        </button>
      </form>

      <p class="alternar">Já tem conta?<a routerLink="/login">Entrar</a></p>
    </q-layout-acesso>
  `,
  styleUrl: './acesso.scss',
})
export class Cadastro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    confirmacao: ['', [Validators.required, igualASenha]],
  });
  protected readonly senhaVisivel = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  constructor() {
    // Mudar a senha revalida a confirmação.
    this.form.controls.senha.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmacao.updateValueAndValidity());
  }

  protected cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nome, email, senha } = this.form.getRawValue();
    this.enviando.set(true);
    this.erro.set('');
    this.auth.cadastrar({ nome: nome.trim(), email, senha }).subscribe({
      next: () => void this.router.navigate(['/']),
      error: (e: unknown) => {
        this.enviando.set(false);
        if (statusDoErro(e) === 409) {
          // Mostra no próprio campo, como no design.
          this.form.controls.email.setErrors({ jaCadastrado: true });
          this.form.controls.email.markAsTouched();
        } else {
          this.erro.set(mensagemDeErro(e));
        }
      },
    });
  }
}
