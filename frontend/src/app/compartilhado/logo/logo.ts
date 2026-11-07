import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Logo do Quita: três quadrados da régua de meses + "quita" (recriada do design). */
@Component({
  selector: 'q-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.height]="altura()"
      viewBox="10 16 200 28"
      role="img"
      aria-label="Quita"
      xmlns="http://www.w3.org/2000/svg"
      [class.animada]="animada()"
    >
      <g transform="translate(10, 17)">
        <rect
          class="bloco bloco--1"
          pathLength="100"
          x="1.25"
          y="1.25"
          width="23.5"
          height="23.5"
          rx="4"
          fill="none"
          stroke="#2E5E4E"
          stroke-width="2.5"
        />
        <rect
          class="bloco bloco--2"
          pathLength="100"
          x="35.25"
          y="1.25"
          width="23.5"
          height="23.5"
          rx="4"
          fill="none"
          stroke="#2E5E4E"
          stroke-width="2.5"
        />
        <rect class="bloco bloco--3" x="68" y="0" width="26" height="26" rx="4" fill="#2E5E4E" />
      </g>
      <text
        class="nome"
        x="114"
        y="40"
        fill="#1E2B30"
        font-family="'Schibsted Grotesk', system-ui, sans-serif"
        font-size="34"
        font-weight="700"
        letter-spacing="-0.03em"
      >
        quita
      </text>
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    svg {
      width: auto;
      display: block;
      overflow: visible;
    }

    /* Entrada: os dois meses se desenham, o terceiro "enche" (pago) e o nome desliza. */
    .animada .bloco--1,
    .animada .bloco--2 {
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
      animation: desenhar 520ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
    }
    .animada .bloco--2 {
      animation-delay: 140ms;
    }
    .animada .bloco--3 {
      transform-box: fill-box;
      transform-origin: center;
      transform: scale(0);
      animation: encher 460ms cubic-bezier(0.34, 1.56, 0.64, 1) 420ms forwards;
    }
    .animada .nome {
      opacity: 0;
      transform: translateX(-10px);
      animation: deslizar 520ms cubic-bezier(0.22, 1, 0.36, 1) 620ms forwards;
    }

    @keyframes desenhar {
      to {
        stroke-dashoffset: 0;
      }
    }
    @keyframes encher {
      to {
        transform: scale(1);
      }
    }
    @keyframes deslizar {
      to {
        opacity: 1;
        transform: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .animada .bloco,
      .animada .nome {
        animation: none;
        stroke-dashoffset: 0;
        transform: none;
        opacity: 1;
      }
    }
  `,
})
export class Logo {
  readonly altura = input(32);
  /** Anima a entrada da logo (usado nas telas de acesso). */
  readonly animada = input(false);
}
