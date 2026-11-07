import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Avatar } from '../../compartilhado/avatar/avatar';
import { EstadoVazio } from '../../compartilhado/estado-vazio/estado-vazio';
import { DataBrPipe, DinheiroPipe } from '../../compartilhado/formatos';
import { SeloSituacao } from '../../compartilhado/selo-situacao/selo-situacao';
import { InquilinosApi } from '../../core/api';
import { mensagemDeErro } from '../../core/erros';
import { InquilinoDaLista } from '../../core/modelos';
import { somarValores } from '../../core/valores';

type Filtro = 'true' | 'false';

@Component({
  selector: 'q-lista-inquilinos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    Avatar,
    EstadoVazio,
    SeloSituacao,
    DinheiroPipe,
    DataBrPipe,
  ],
  templateUrl: './lista-inquilinos.html',
  styleUrl: './lista-inquilinos.scss',
})
export class ListaInquilinos implements OnInit {
  private readonly api = inject(InquilinosApi);

  protected readonly filtro = signal<Filtro>('true');
  protected readonly inquilinos = signal<InquilinoDaLista[] | null>(null);
  protected readonly erro = signal('');

  protected readonly indicadores = computed(() => {
    const lista = this.inquilinos() ?? [];
    return {
      emAtraso: lista.filter((i) => i.mesesAtrasados > 0).length,
      mesesAtrasados: lista.reduce((total, i) => total + i.mesesAtrasados, 0),
      totalMensal: somarValores(lista.map((i) => i.valorAluguel)),
    };
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected trocarFiltro(filtro: Filtro): void {
    this.filtro.set(filtro);
    this.carregar();
  }

  private carregar(): void {
    this.inquilinos.set(null);
    this.erro.set('');
    this.api.listar(this.filtro()).subscribe({
      next: (lista) => this.inquilinos.set(lista),
      error: (e: unknown) => this.erro.set(mensagemDeErro(e)),
    });
  }

  protected textoAtraso(meses: number): string {
    return meses === 1 ? '1 mês atrasado' : `${meses} meses atrasado`;
  }
}
