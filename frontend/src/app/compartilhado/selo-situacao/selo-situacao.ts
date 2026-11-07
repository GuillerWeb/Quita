import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type TipoSelo = 'PAGO' | 'AGUARDANDO' | 'ATRASADO' | 'NEUTRO';

const TEXTOS: Record<TipoSelo, string> = {
  PAGO: 'Pago',
  AGUARDANDO: 'Aguardando',
  ATRASADO: 'Atrasado',
  NEUTRO: '',
};

/** Selo de situação: sempre ponto + texto, nunca só cor. */
@Component({
  selector: 'q-selo-situacao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="selo selo--{{ classe() }}"
    ><span class="ponto" aria-hidden="true"></span>{{ rotulo() }}</span
  >`,
  styles: `
    :host {
      display: inline-flex;
    }
    .selo {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 4px;
      white-space: nowrap;
      font-size: 13px;
      line-height: 18px;
      font-weight: 600;
    }
    .ponto {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .selo--pago {
      background: var(--q-primaria-suave);
      color: var(--q-primaria);
    }
    .selo--aguardando {
      background: var(--q-aguardando-claro);
      color: var(--q-aguardando);
    }
    .selo--atrasado {
      background: var(--q-atrasado-claro);
      color: var(--q-atrasado);
    }
    .selo--neutro {
      background: var(--q-superficie-media);
      color: var(--q-texto-suave);
    }
  `,
})
export class SeloSituacao {
  readonly situacao = input.required<TipoSelo>();
  /** Texto alternativo ("Em dia", "2 meses atrasado", "Inativo"...). */
  readonly texto = input<string>();

  protected readonly classe = computed(() => this.situacao().toLowerCase());
  protected readonly rotulo = computed(() => this.texto() ?? TEXTOS[this.situacao()]);
}
