import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { Avatar } from '../../compartilhado/avatar/avatar';
import {
  DadosConfirmacao,
  DialogoConfirmacao,
} from '../../compartilhado/dialogos/dialogo-confirmacao';
import { DadosPagamento, DialogoPagamento } from '../../compartilhado/dialogos/dialogo-pagamento';
import { CompetenciaPipe, DataBrPipe, DinheiroPipe } from '../../compartilhado/formatos';
import { Notificacao } from '../../compartilhado/notificacao.service';
import { MesDaRegua, ReguaMeses } from '../../compartilhado/regua-meses/regua-meses';
import { SeloSituacao } from '../../compartilhado/selo-situacao/selo-situacao';
import { InquilinosApi, PagamentosApi } from '../../core/api';
import { competenciaCurta, hojeLocal, mesCurto, paraIso, somarMeses } from '../../core/datas';
import { mensagemDeErro } from '../../core/erros';
import { InquilinoDetalhe, Pagamento, Situacao } from '../../core/modelos';
import { DialogoSaida } from './dialogo-saida';

const TEXTO_SITUACAO: Record<Situacao, string> = {
  PAGO: 'Pago',
  AGUARDANDO: 'Aguardando',
  ATRASADO: 'Atrasado',
};

@Component({
  selector: 'q-detalhe-inquilino',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    Avatar,
    ReguaMeses,
    SeloSituacao,
    DinheiroPipe,
    DataBrPipe,
    CompetenciaPipe,
  ],
  templateUrl: './detalhe-inquilino.html',
  styleUrl: './detalhe-inquilino.scss',
})
export class DetalheInquilino implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(InquilinosApi);
  private readonly pagamentosApi = inject(PagamentosApi);
  private readonly dialogo = inject(MatDialog);
  private readonly notificacao = inject(Notificacao);
  private readonly router = inject(Router);

  protected readonly inquilino = signal<InquilinoDetalhe | null>(null);
  protected readonly erro = signal('');
  protected readonly ocupado = signal(false);
  protected readonly competenciaAtual = paraIso(hojeLocal()).slice(0, 7);

  /** RN-13: só pode excluir se nenhum mês estiver pago. */
  protected readonly podeExcluir = computed(
    () => !this.inquilino()?.pagamentos.some((p) => p.status === 'PAGO'),
  );

  protected readonly mesAtual = computed(() =>
    this.inquilino()?.pagamentos.find((p) => p.competencia === this.competenciaAtual),
  );

  /** Últimos 12 meses até o mês atual (ou até o último lançado, para inativos). */
  private readonly janela = computed(() => {
    const i = this.inquilino();
    if (!i) return [];
    const porCompetencia = new Map(i.pagamentos.map((p) => [p.competencia, p]));
    const fim =
      i.ativo || !i.pagamentos.length ? this.competenciaAtual : i.pagamentos[0].competencia;
    return Array.from({ length: 12 }, (_, n) => {
      const competencia = somarMeses(fim, n - 11);
      return { competencia, pagamento: porCompetencia.get(competencia) };
    });
  });

  protected readonly regua = computed<MesDaRegua[]>(() =>
    this.janela().map(({ competencia, pagamento }) => ({
      rotulo: mesCurto(competencia),
      estado: pagamento ? pagamento.situacao : 'VAZIO',
      descricao: `${competenciaCurta(competencia)} — ${pagamento ? TEXTO_SITUACAO[pagamento.situacao] : 'sem cobrança'}`,
      atual: competencia === this.competenciaAtual,
    })),
  );

  protected readonly legenda = computed(() => {
    const pagamentos = this.inquilino()?.pagamentos ?? [];
    const contar = (s: Situacao) => pagamentos.filter((p) => p.situacao === s).length;
    return {
      pagos: contar('PAGO'),
      aguardando: contar('AGUARDANDO'),
      atrasados: contar('ATRASADO'),
    };
  });

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.api.buscar(this.id()).subscribe({
      next: (i) => this.inquilino.set(i),
      error: (e: unknown) => this.erro.set(mensagemDeErro(e)),
    });
  }

  protected pagarDaRegua(indice: number): void {
    const pagamento = this.janela()[indice]?.pagamento;
    if (pagamento) this.pagar(pagamento);
  }

  protected pagar(pagamento: Pagamento): void {
    const i = this.inquilino();
    if (!i) return;
    const dados: DadosPagamento = { pagamento, nome: i.nome, imovel: i.imovel.nome };
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

  protected desfazer(pagamento: Pagamento): void {
    this.confirmar({
      titulo: `Desfazer pagamento de ${competenciaCurta(pagamento.competencia)}?`,
      mensagem:
        'O mês volta para "aguardando" e a data de pagamento é apagada. Use para corrigir um engano.',
      confirmar: 'Desfazer pagamento',
      icone: 'undo',
      perigo: true,
    }).subscribe((ok) => {
      if (!ok) return;
      this.pagamentosApi.desfazer(pagamento.id).subscribe({
        next: () => {
          this.notificacao.sucesso('Pagamento desfeito');
          this.carregar();
        },
        error: (e: unknown) => this.notificacao.erro(e),
      });
    });
  }

  protected registrarSaida(): void {
    const i = this.inquilino();
    if (!i) return;
    this.dialogo
      .open(DialogoSaida, {
        data: i,
        width: '480px',
        maxWidth: 'calc(100vw - 32px)',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((atualizado?: InquilinoDetalhe) => {
        if (!atualizado) return;
        this.inquilino.set(atualizado);
        this.notificacao.sucesso(`Saída registrada. ${atualizado.imovel.nome} está vago.`);
      });
  }

  protected excluir(): void {
    const i = this.inquilino();
    if (!i) return;
    this.confirmar({
      titulo: `Excluir ${i.nome}?`,
      mensagem:
        'Use só para corrigir um cadastro feito por engano: o inquilino e os meses em aberto são apagados. Para quem morou no imóvel, registre a saída.',
      confirmar: 'Excluir inquilino',
      icone: 'delete',
      perigo: true,
    }).subscribe((ok) => {
      if (!ok) return;
      this.ocupado.set(true);
      this.api.excluir(i.id).subscribe({
        next: () => {
          this.notificacao.sucesso('Inquilino excluído');
          void this.router.navigate(['/inquilinos']);
        },
        error: (e: unknown) => {
          this.ocupado.set(false);
          this.notificacao.erro(e);
        },
      });
    });
  }

  private confirmar(dados: DadosConfirmacao) {
    return this.dialogo
      .open(DialogoConfirmacao, { data: dados, width: '440px', maxWidth: 'calc(100vw - 32px)' })
      .afterClosed();
  }
}
