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
    >
      <g transform="translate(10, 17)">
        <rect x="1.25" y="1.25" width="23.5" height="23.5" rx="4" fill="none" stroke="#2E5E4E" stroke-width="2.5" />
        <rect x="35.25" y="1.25" width="23.5" height="23.5" rx="4" fill="none" stroke="#2E5E4E" stroke-width="2.5" />
        <rect x="68" y="0" width="26" height="26" rx="4" fill="#2E5E4E" />
      </g>
      <text
        x="114"
        y="40"
        fill="#1E2B30"
        font-family="'Schibsted Grotesk', system-ui, sans-serif"
        font-size="34"
        font-weight="700"
        letter-spacing="-0.03em"
      >quita</text>
    </svg>
  `,
  styles: `
    :host { display: inline-flex; }
    svg { width: auto; display: block; }
  `,
})
export class Logo {
  readonly altura = input(32);
}
