import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Avatar } from '../../compartilhado/avatar/avatar';
import { DadosPagamento, DialogoPagamento } from '../../compartilhado/dialogos/dialogo-pagamento';
import { EstadoVazio } from '../../compartilhado/estado-vazio/estado-vazio';
import { DataBrPipe, DinheiroPipe } from '../../compartilhado/formatos';
import { Notificacao } from '../../compartilhado/notificacao.service';
import { MesDaRegua, ReguaMeses } from '../../compartilhado/regua-meses/regua-meses';
import { PainelApi } from '../../core/api';
import { competenciaCurta, mesCurto, mesPorExtenso } from '../../core/datas';
import { mensagemDeErro } from '../../core/erros';
import { AtrasadoDoPainel, Pagamento, Painel as DadosPainel } from '../../core/modelos';

@Component({
  selector: 'q-painel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    Avatar,
    EstadoVazio,
    ReguaMeses,
    DinheiroPipe,
    DataBrPipe,
    DecimalPipe,
  ],
  templateUrl: './painel.html',
  styleUrl: './painel.scss',
})
export class Painel implements OnInit {
  private readonly api = inject(PainelApi);
  private readonly dialogo = inject(MatDialog);
  private readonly notificacao = inject(Notificacao);

  protected readonly painel = signal<DadosPainel | null>(null);
  protected readonly erro = signal('');

  protected readonly titulo = computed(() => {
    const p = this.painel();
    return p ? mesPorExtenso(p.competencia) : 'Painel';
  });

  /** Percentual recebido do esperado no mês (só para a barra; valores vêm da API). */
  protected readonly percentual = computed(() => {
    const p = this.painel();
    const esperado = p ? Number(p.totais.esperado) : 0;
    return esperado > 0 ? (Number(p!.totais.recebido) / esperado) * 100 : 0;
  });

  /** Conta sem nada cadastrado: mostra o estado vazio. */
  protected readonly vazio = computed(() => {
    const p = this.painel();
    return (
      !!p &&
      Number(p.totais.esperado) === 0 &&
      p.atrasados.length === 0 &&
      p.aVencer.length === 0 &&
      p.imoveisVagos.length === 0
    );
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.erro.set('');
    this.api.carregar().subscribe({
      next: (p) => this.painel.set(p),
      error: (e: unknown) => this.erro.set(mensagemDeErro(e)),
    });
  }

  protected regua(atrasado: AtrasadoDoPainel): MesDaRegua[] {
    return atrasado.pagamentos.map((p) => ({
      rotulo: mesCurto(p.competencia),
      estado: 'ATRASADO',
      descricao: `${competenciaCurta(p.competencia)} — Atrasado`,
    }));
  }

  protected diaDoVencimento(atrasado: AtrasadoDoPainel): string {
    return atrasado.pagamentos[0].dataVencimento.slice(8, 10);
  }

  protected rotuloMes(pagamento: Pagamento): string {
    return competenciaCurta(pagamento.competencia);
  }

  protected pagar(pagamento: Pagamento, nome: string, imovel: string): void {
    const dados: DadosPagamento = { pagamento, nome, imovel };
    this.dialogo
      .open(DialogoPagamento, {
        data: dados,
        width: '480px',
        maxWidth: 'calc(100vw - 32px)',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((pago?: Pagamento) => {
        if (!pago) return;
        this.notificacao.sucesso(`Pagamento de ${competenciaCurta(pago.competencia)} registrado`);
        this.carregar();
      });
  }
}
