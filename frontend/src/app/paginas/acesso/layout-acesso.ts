import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Logo } from '../../compartilhado/logo/logo';
import { MesDaRegua, ReguaMeses } from '../../compartilhado/regua-meses/regua-meses';

const INICIAIS = ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'];

// Régua ilustrativa do design: 7 pagos, 1 aguardando, 1 atrasado, 3 futuros.
const EXEMPLO: MesDaRegua[] = INICIAIS.map((rotulo, i) => {
  const estado = i < 7 ? 'PAGO' : i === 7 ? 'AGUARDANDO' : i === 8 ? 'ATRASADO' : 'FUTURO';
  return { rotulo, estado, descricao: '' };
});

/** Moldura das telas de login e cadastro: apresentação à esquerda, formulário à direita. */
@Component({
  selector: 'q-layout-acesso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Logo, ReguaMeses],
  template: `
    <div class="acesso">
      <section class="apresentacao" aria-hidden="true">
        <q-logo [altura]="28" />
        <div class="chamada">
          <h1>Seus aluguéis, mês a mês, num só lugar.</h1>
          <p>
            A clareza do livro-caixa com a facilidade do digital. Controle inquilinos,
            vencimentos e histórico sem complicação.
          </p>
        </div>

        <div class="exemplo">
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
              <span class="rotulo-secao">12 meses</span>
            </div>
            <q-regua-meses [meses]="exemplo" tamanho="g" />
          </div>
          <ul class="legenda">
            <li><span class="ponto ponto--pago"></span>Pago (7)</li>
            <li><span class="ponto ponto--aguardando"></span>Aguardando (1)</li>
            <li><span class="ponto ponto--atrasado"></span>Atrasado (1)</li>
            <li><span class="ponto ponto--futuro"></span>Futuro (3)</li>
          </ul>
        </div>

        <small>Gestão precisa de locações e recebimentos diretos.</small>
      </section>

      <main class="lado-formulario">
        <div class="logo-celular"><q-logo [altura]="26" /></div>
        <div class="formulario-area">
          <ng-content />
        </div>
        <small class="rodape">Quita © {{ ano }} • Feito para proprietários de imóveis</small>
      </main>
    </div>
  `,
  styleUrl: './layout-acesso.scss',
})
export class LayoutAcesso {
  protected readonly exemplo = EXEMPLO;
  protected readonly ano = new Date().getFullYear();
}
