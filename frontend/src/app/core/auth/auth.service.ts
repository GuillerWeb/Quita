import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Proprietario, RespostaAuth } from '../modelos';

const CHAVE_TOKEN = 'inquilinos.token';
const CHAVE_PROPRIETARIO = 'inquilinos.proprietario';

// localStorage pode falhar (modo privado, bloqueio do navegador): nunca deixa a tela quebrar.
function ler(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: string | null): void {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, valor);
  } catch {
    // sem armazenamento: a sessão dura até fechar a aba
  }
}

function lerProprietario(): Proprietario | null {
  try {
    const salvo = ler(CHAVE_PROPRIETARIO);
    return salvo ? (JSON.parse(salvo) as Proprietario) : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly url = `${environment.apiUrl}/auth`;

  private readonly _token = signal<string | null>(ler(CHAVE_TOKEN));
  private readonly _proprietario = signal<Proprietario | null>(lerProprietario());

  readonly token = this._token.asReadonly();
  readonly proprietario = this._proprietario.asReadonly();
  readonly logado = computed(() => this._token() !== null);

  cadastrar(dados: { nome: string; email: string; senha: string }): Observable<RespostaAuth> {
    return this.http
      .post<RespostaAuth>(`${this.url}/cadastro`, dados)
      .pipe(tap((r) => this.iniciarSessao(r)));
  }

  entrar(dados: { email: string; senha: string }): Observable<RespostaAuth> {
    return this.http
      .post<RespostaAuth>(`${this.url}/login`, dados)
      .pipe(tap((r) => this.iniciarSessao(r)));
  }

  /** Atualiza nome/e-mail do proprietário (usado ao abrir o layout interno). */
  carregarProprietario(): void {
    this.http.get<Proprietario>(`${this.url}/eu`).subscribe({
      next: (p) => this.definirProprietario(p),
      error: () => undefined, // 401 já é tratado pelo interceptor
    });
  }

  sair(): void {
    this.limparSessao();
    void this.router.navigate(['/login']);
  }

  limparSessao(): void {
    this._token.set(null);
    this._proprietario.set(null);
    gravar(CHAVE_TOKEN, null);
    gravar(CHAVE_PROPRIETARIO, null);
  }

  private iniciarSessao({ token, proprietario }: RespostaAuth): void {
    this._token.set(token);
    gravar(CHAVE_TOKEN, token);
    this.definirProprietario(proprietario);
  }

  private definirProprietario(p: Proprietario): void {
    this._proprietario.set(p);
    gravar(CHAVE_PROPRIETARIO, JSON.stringify(p));
  }
}
