import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { Logo } from '../../compartilhado/logo/logo';
import { EstadoMes, MesDaRegua, ReguaMeses } from '../../compartilhado/regua-meses/regua-meses';

const INICIAIS = ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'];
const AGO = 7;
const SET = 8;
const OUT = 9;

// Régua ilustrativa do design: 7 pagos, 1 aguardando, 1 atrasado, 3 futuros.
const ESTADO_INICIAL: EstadoMes[] = INICIAIS.map((_, i) =>
  i < 7 ? 'PAGO' : i === AGO ? 'AGUARDANDO' : i === SET ? 'ATRASADO' : 'FUTURO',
);

interface Passo {
  /** Espera antes de aplicar o passo (ms). */
  espera: number;
  aplicar: () => void;
}

/** Moldura das telas de login e cadastro: apresentação à esquerda, formulário à direita. */
@Component({
  selector: 'q-layout-acesso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Logo, ReguaMeses],
  template: `
    <div class="acesso">
      <section class="apresentacao" aria-hidden="true">
        <q-logo class="entra entra--1" [altura]="28" [animada]="true" />
        <div class="chamada entra entra--2">
          <h1>Seus aluguéis, mês a mês, num só lugar.</h1>
          <p>
            A clareza do livro-caixa com a facilidade do digital. Controle inquilinos, vencimentos e
            histórico sem complicação.
          </p>
        </div>

        <div class="exemplo entra entra--3">
          <div class="exemplo-topo">
            <div>
              <strong>Casa 2 — Mariana Souza</strong>
              <span>Aluguel: <b class="numero">R$ 2.450,00</b> • Vencimento: <b>dia 10</b></span>
            </div>
            <span class="chip chip--ok"><span class="chip__ponto"></span>Exemplo</span>
          </div>
          <div class="exemplo-regua">
            <div class="exemplo-rotulos">
              <span class="rotulo-secao">Histórico do ano</span>
              @if (aviso(); as texto) {
                <span class="rotulo-secao aviso-exemplo" [class.aviso-exemplo--novo]="avisoNovo()">
                  <span class="material-symbols-outlined">{{
                    avisoNovo() ? 'autorenew' : 'check_circle'
                  }}</span>
                  {{ texto }}
                </span>
              } @else {
                <span class="rotulo-secao">12 meses</span>
              }
            </div>
            <q-regua-meses [meses]="meses()" tamanho="g" [animada]="true" />
          </div>
          <ul class="legenda">
            <li><span class="ponto ponto--pago"></span>Pago ({{ contagem().PAGO }})</li>
            <li>
              <span class="ponto ponto--aguardando"></span>Aguardando ({{ contagem().AGUARDANDO }})
            </li>
            <li><span class="ponto ponto--atrasado"></span>Atrasado ({{ contagem().ATRASADO }})</li>
            <li><span class="ponto ponto--futuro"></span>Futuro ({{ contagem().FUTURO }})</li>
          </ul>
        </div>

        <small class="entra entra--4">Gestão precisa de locações e recebimentos diretos.</small>
      </section>

      <main class="lado-formulario">
        <div class="logo-celular"><q-logo [altura]="26" [animada]="true" /></div>
        <div class="formulario-area entra entra--form">
          <ng-content />
        </div>
        <small class="rodape">Quita © {{ ano }} • Feito para proprietários de imóveis</small>
      </main>
    </div>
  `,
  styleUrl: './layout-acesso.scss',
})
export class LayoutAcesso {
  protected readonly ano = new Date().getFullYear();

  private readonly estados = signal<EstadoMes[]>(ESTADO_INICIAL);
  protected readonly aviso = signal('');
  protected readonly avisoNovo = signal(false);

  protected readonly meses = computed<MesDaRegua[]>(() =>
    this.estados().map((estado, i) => ({ rotulo: INICIAIS[i], estado, descricao: '' })),
  );

  protected readonly contagem = computed(() => {
    const c = { PAGO: 0, AGUARDANDO: 0, ATRASADO: 0, FUTURO: 0 };
    for (const e of this.estados()) if (e in c) c[e as keyof typeof c]++;
    return c;
  });

  private temporizador?: ReturnType<typeof setTimeout>;

  constructor() {
    const reduzir =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzir) return; // mostra a régua parada, no estado do design

    this.estados.set(ESTADO_INICIAL.map(() => 'VAZIO'));
    this.executar(this.roteiro(), 0);
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  /**
   * Mostra, em loop, o funcionamento do Quita: os meses aparecem, o proprietário marca o
   * atrasado e o aguardando como pagos e o mês seguinte é gerado sozinho.
   */
  private roteiro(): Passo[] {
    const passos: Passo[] = [];
    // Os meses entram um a um, já com a situação de cada um.
    ESTADO_INICIAL.forEach((estado, i) =>
      passos.push({ espera: i === 0 ? 900 : 70, aplicar: () => this.mudar(i, estado) }),
    );
    passos.push(
      { espera: 2200, aplicar: () => this.pagar(SET, 'Setembro marcado como pago') },
      { espera: 2000, aplicar: () => this.pagar(AGO, 'Agosto marcado como pago') },
      {
        espera: 2200,
        aplicar: () => {
          this.mudar(OUT, 'AGUARDANDO');
          this.avisar('Outubro gerado sozinho', true);
        },
      },
      {
        espera: 3200,
        aplicar: () => {
          this.avisar('');
          this.estados.set(ESTADO_INICIAL.map(() => 'VAZIO'));
        },
      },
    );
    return passos;
  }

  private executar(passos: Passo[], i: number): void {
    const passo = passos[i % passos.length];
    // Ao recomeçar o loop, a primeira espera é menor (a página já entrou).
    const espera = i > 0 && i % passos.length === 0 ? 500 : passo.espera;
    this.temporizador = setTimeout(() => {
      passo.aplicar();
      this.executar(passos, i + 1);
    }, espera);
  }

  private mudar(indice: number, estado: EstadoMes): void {
    this.estados.update((lista) => lista.map((e, i) => (i === indice ? estado : e)));
  }

  private pagar(indice: number, texto: string): void {
    this.mudar(indice, 'PAGO');
    this.avisar(texto);
  }

  private avisar(texto: string, novo = false): void {
    this.aviso.set(texto);
    this.avisoNovo.set(novo);
  }
}
