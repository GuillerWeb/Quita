import { LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type EstadoMes = 'PAGO' | 'AGUARDANDO' | 'ATRASADO' | 'FUTURO' | 'VAZIO';

export interface MesDaRegua {
  /** Rótulo abaixo do quadrado: "out", "j"... */
  rotulo: string;
  estado: EstadoMes;
  /** Texto completo para leitores de tela e dica: "out/2026 — Atrasado". */
  descricao: string;
  /** Destaca o mês atual. */
  atual?: boolean;
}

const ICONES: Record<EstadoMes, string> = {
  PAGO: 'check',
  AGUARDANDO: 'schedule',
  ATRASADO: 'priority_high',
  FUTURO: '',
  VAZIO: '',
};

/**
 * Régua de meses (assinatura visual do design). A cor nunca vem sozinha: cada quadrado
 * tem ícone e descrição, e as telas mostram o selo de situação ao lado.
 */
@Component({
  selector: 'q-regua-meses',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="regua" [class.regua--grande]="tamanho() === 'g'" [attr.aria-label]="rotulo()">
      @for (mes of meses(); track $index) {
        <li class="mes" [class.mes--atual]="mes.atual">
          @if (clicavel() && mes.estado !== 'PAGO' && mes.estado !== 'FUTURO' && mes.estado !== 'VAZIO') {
            <button
              type="button"
              class="quadrado quadrado--{{ mes.estado | lowercase }}"
              [attr.aria-label]="'Marcar ' + mes.descricao + ' como pago'"
              [title]="mes.descricao"
              (click)="selecionar.emit($index)"
            >
              <span class="material-symbols-outlined" aria-hidden="true">{{ icone(mes.estado) }}</span>
            </button>
          } @else {
            <span class="quadrado quadrado--{{ mes.estado | lowercase }}" [title]="mes.descricao">
              @if (icone(mes.estado)) {
                <span class="material-symbols-outlined" aria-hidden="true">{{ icone(mes.estado) }}</span>
              } @else if (mes.estado === 'FUTURO') {
                <span class="ponto" aria-hidden="true"></span>
              }
              <span class="visualmente-oculto">{{ mes.descricao }}</span>
            </span>
          }
          <span class="rotulo" aria-hidden="true">{{ mes.rotulo }}</span>
        </li>
      }
    </ol>
  `,
  styleUrl: './regua-meses.scss',
  imports: [LowerCasePipe],
})
export class ReguaMeses {
  readonly meses = input.required<MesDaRegua[]>();
  readonly tamanho = input<'p' | 'g'>('p');
  readonly clicavel = input(false);
  readonly rotulo = input('Histórico de meses');
  readonly selecionar = output<number>();

  protected readonly icone = (estado: EstadoMes) => ICONES[estado];
}

