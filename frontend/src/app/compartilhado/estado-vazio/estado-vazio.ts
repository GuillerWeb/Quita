import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MesDaRegua, ReguaMeses } from '../regua-meses/regua-meses';

const FOLHA_EM_BRANCO: MesDaRegua[] = ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'].map(
  (rotulo) => ({ rotulo, estado: 'VAZIO', descricao: '' }),
);

/** Estado vazio do design: régua "folha em branco", título, texto e ação (via conteúdo). */
@Component({
  selector: 'q-estado-vazio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReguaMeses],
  template: `
    <div class="vazio">
      @if (mostrarRegua()) {
        <div class="folha" aria-hidden="true">
          <span class="rotulo-secao">Folha em branco</span>
          <q-regua-meses [meses]="folha" />
        </div>
      }
      <h2>{{ titulo() }}</h2>
      <p>{{ texto() }}</p>
      <div class="acao"><ng-content /></div>
    </div>
  `,
  styles: `
    .vazio {
      display: flex; flex-direction: column; align-items: center; text-align: center;
      gap: 12px; padding: 48px 24px;
    }
    .folha {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      margin-bottom: 20px;
    }
    .folha q-regua-meses {
      background: var(--q-superficie-baixa); padding: 10px 12px 8px; border-radius: 8px;
    }
    h2 { font-size: 22px; line-height: 30px; font-weight: 600; }
    p { margin: 0; max-width: 560px; color: var(--q-texto-suave); font-size: 15px; line-height: 24px; }
    .acao { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    @media (max-width: 480px) { .folha { display: none; } }
  `,
})
export class EstadoVazio {
  readonly titulo = input.required<string>();
  readonly texto = input('');
  readonly mostrarRegua = input(true);

  protected readonly folha = FOLHA_EM_BRANCO;
}
