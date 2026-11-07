import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { EstadoVazio } from '../../compartilhado/estado-vazio/estado-vazio';
import { SeloSituacao } from '../../compartilhado/selo-situacao/selo-situacao';
import { ImoveisApi } from '../../core/api';
import { mensagemDeErro } from '../../core/erros';
import { Imovel } from '../../core/modelos';

@Component({
  selector: 'q-lista-imoveis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule, EstadoVazio, SeloSituacao],
  template: `
    <div class="pagina">
      <header class="pagina-cabecalho">
        <div class="pagina-cabecalho__titulo">
          <h1 class="titulo-pagina">Imóveis</h1>
          @if (imoveis(); as lista) {
            <span class="chip"
              >{{ lista.length }}
              {{ lista.length === 1 ? 'imóvel cadastrado' : 'imóveis cadastrados' }}</span
            >
          }
        </div>
        <div class="pagina-cabecalho__acoes">
          <a mat-flat-button routerLink="/imoveis/novo">
            <span class="botao-carregando"
              ><span class="material-symbols-outlined" aria-hidden="true">add</span>Cadastrar
              imóvel</span
            >
          </a>
        </div>
      </header>

      @if (erro()) {
        <div class="aviso aviso--erro" role="alert">
          <span class="material-symbols-outlined" aria-hidden="true">error</span>{{ erro() }}
        </div>
      }

      @if (imoveis(); as lista) {
        <section class="cartao">
          @if (lista.length === 0) {
            <q-estado-vazio
              titulo="Você ainda não tem imóveis cadastrados."
              texto="Cadastre seu primeiro imóvel para acompanhar inquilinos, vencimentos e ver a régua de pagamentos ganhar vida."
            >
              <a mat-flat-button routerLink="/imoveis/novo">
                <span class="botao-carregando"
                  ><span class="material-symbols-outlined" aria-hidden="true">add_home</span
                  >Cadastrar imóvel</span
                >
              </a>
            </q-estado-vazio>
          } @else {
            <div class="tabela-cabecalho" aria-hidden="true">
              <span>Imóvel</span><span>Inquilino atual</span><span></span>
            </div>
            <ul class="tabela">
              @for (imovel of lista; track imovel.id) {
                <li class="tabela-linha">
                  <div class="celula-imovel">
                    <span class="icone-imovel" aria-hidden="true"
                      ><span class="material-symbols-outlined">apartment</span></span
                    >
                    <div class="linha-texto">
                      <strong>{{ imovel.nome }}</strong>
                      <span>{{ imovel.endereco || 'Sem endereço' }}</span>
                    </div>
                  </div>
                  <div class="celula-inquilino">
                    @if (imovel.inquilinoAtivo; as inquilino) {
                      <a [routerLink]="['/inquilinos', inquilino.id]">{{ inquilino.nome }}</a>
                    } @else {
                      <q-selo-situacao situacao="NEUTRO" texto="Vago" />
                    }
                  </div>
                  <div class="celula-acoes">
                    @if (!imovel.inquilinoAtivo) {
                      <a
                        mat-button
                        routerLink="/inquilinos/novo"
                        [queryParams]="{ imovelId: imovel.id }"
                        >Cadastrar inquilino</a
                      >
                    }
                    <a
                      mat-stroked-button
                      [routerLink]="['/imoveis', imovel.id, 'editar']"
                      [attr.aria-label]="'Editar ' + imovel.nome"
                      >Editar</a
                    >
                  </div>
                </li>
              }
            </ul>
          }
        </section>
      } @else if (!erro()) {
        <div class="carregando-pagina">
          <mat-spinner diameter="40" aria-label="Carregando imóveis" />
        </div>
      }
    </div>
  `,
  styleUrl: './imoveis.scss',
})
export class ListaImoveis implements OnInit {
  private readonly api = inject(ImoveisApi);
  protected readonly imoveis = signal<Imovel[] | null>(null);
  protected readonly erro = signal('');

  ngOnInit(): void {
    this.api.listar().subscribe({
      next: (lista) => this.imoveis.set(lista),
      error: (e: unknown) => this.erro.set(mensagemDeErro(e)),
    });
  }
}
