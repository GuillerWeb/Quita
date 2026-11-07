import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { mensagemDeErro } from '../../core/erros';
import { LayoutAcesso } from './layout-acesso';

@Component({
  selector: 'q-login',
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
        <h1>Entrar</h1>
        <p>Acesse sua conta para gerenciar seus imóveis.</p>
      </header>

      <form class="formulario" [formGroup]="form" (ngSubmit)="entrar()" novalidate>
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
              autocomplete="current-password"
              placeholder="Sua senha de acesso"
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
              <mat-error>Informe a senha.</mat-error>
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
            <span class="botao-carregando"><mat-spinner diameter="20" />Entrando…</span>
          } @else {
            <span class="botao-carregando"
              >Entrar
              <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></span
            >
          }
        </button>
      </form>

      <p class="alternar">Ainda não tem conta?<a routerLink="/cadastro">Criar conta</a></p>
    </q-layout-acesso>
  `,
  styleUrl: './acesso.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });
  protected readonly senhaVisivel = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.erro.set('');
    this.auth.entrar(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigate(['/']),
      error: (e: unknown) => {
        this.erro.set(mensagemDeErro(e));
        this.enviando.set(false);
      },
    });
  }
}
