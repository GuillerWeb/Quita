import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Círculo com as iniciais do nome; vermelho claro para quem está devendo. */
@Component({
  selector: 'q-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="avatar" [class.avatar--alerta]="alerta()" [class.avatar--grande]="grande()" aria-hidden="true">{{ iniciais() }}</span>`,
  styles: `
    :host { display: inline-flex; flex-shrink: 0; }
    .avatar {
      width: 48px; height: 48px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--q-superficie-media); color: var(--q-primaria-escura);
      font-family: var(--q-fonte-titulo); font-weight: 600; font-size: 16px;
    }
    .avatar--alerta { background: var(--q-atrasado-claro); color: var(--q-atrasado); }
    .avatar--grande { width: 64px; height: 64px; border-radius: 12px; font-size: 22px; }
  `,
})
export class Avatar {
  readonly nome = input.required<string>();
  readonly alerta = input(false);
  readonly grande = input(false);

  protected readonly iniciais = computed(() => {
    const partes = this.nome().trim().split(/\s+/).filter(Boolean);
    const primeira = partes[0]?.[0] ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
  });
}
