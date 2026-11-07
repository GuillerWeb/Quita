import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { EstadoVazio } from '../../compartilhado/estado-vazio/estado-vazio';
import { Notificacao } from '../../compartilhado/notificacao.service';
import { ImoveisApi, InquilinosApi } from '../../core/api';
import { paraIso } from '../../core/datas';
import { mensagemDeErro } from '../../core/erros';
import { DadosInquilino, Imovel } from '../../core/modelos';
import { valorParaApi, valorParaCampo } from '../../core/valores';

function valorValido(controle: AbstractControl<string>): ValidationErrors | null {
  if (!controle.value) return null; // "required" cuida do vazio
  return valorParaApi(controle.value) ? null : { valor: true };
}

function cpfValido(controle: AbstractControl<string>): ValidationErrors | null {
  const texto = controle.value?.trim();
  if (!texto) return null;
  return /^[\d.\-\s]+$/.test(texto) && texto.replace(/\D/g, '').length === 11 ? null : { cpf: true };
}

/** `/inquilinos/novo` (aceita `?imovelId=`) e `/inquilinos/:id/editar`. */
@Component({
  selector: 'q-formulario-inquilino',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    EstadoVazio,
  ],
  templateUrl: './formulario-inquilino.html',
  styles: `
    .opcional { font-weight: 400; color: var(--q-texto-suave); }
    .prefixo { color: var(--q-texto-suave); font-weight: 600; margin-right: 6px; }
    .secao-form { grid-column: 1 / -1; margin-top: 12px; }
    textarea { min-height: 72px; }
  `,
})
export class FormularioInquilino implements OnInit {
  /** Rota de edição: `/inquilinos/:id/editar`. */
  readonly id = input<string>();
  /** Query `?imovelId=` vindo do painel ou da lista de imóveis. */
  readonly imovelId = input<string>();

  private readonly inquilinosApi = inject(InquilinosApi);
  private readonly imoveisApi = inject(ImoveisApi);
  private readonly router = inject(Router);
  private readonly notificacao = inject(Notificacao);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    imovelId: ['', Validators.required],
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    valorAluguel: ['', [Validators.required, valorValido]],
    diaVencimento: [10, [Validators.required, Validators.min(1), Validators.max(31), Validators.pattern(/^\d+$/)]],
    dataEntrada: [null as Date | null, Validators.required],
    telefone: ['', Validators.maxLength(20)],
    email: ['', [Validators.email]],
    cpf: ['', cpfValido],
    observacoes: ['', Validators.maxLength(500)],
  });

  protected readonly imoveisVagos = signal<Imovel[]>([]);
  protected readonly carregando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');
  protected readonly edicao = computed(() => !!this.id());
  protected readonly semImovelVago = computed(
    () => !this.edicao() && !this.carregando() && this.imoveisVagos().length === 0,
  );

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      // Na edição, imóvel e data de entrada não mudam (RN-11).
      this.form.controls.imovelId.disable();
      this.form.controls.dataEntrada.disable();
    }
    forkJoin({
      imoveis: id ? of([]) : this.imoveisApi.listar(),
      inquilino: id ? this.inquilinosApi.buscar(id) : of(null),
    }).subscribe({
      next: ({ imoveis, inquilino }) => {
        const vagos = imoveis.filter((i) => !i.inquilinoAtivo);
        this.imoveisVagos.set(vagos);
        const sugerido = this.imovelId();
        if (sugerido && vagos.some((i) => i.id === sugerido)) {
          this.form.controls.imovelId.setValue(sugerido);
        } else if (vagos.length === 1) {
          this.form.controls.imovelId.setValue(vagos[0].id);
        }
        if (inquilino) {
          this.form.patchValue({
            nome: inquilino.nome,
            valorAluguel: valorParaCampo(inquilino.valorAluguel),
            diaVencimento: inquilino.diaVencimento,
            telefone: inquilino.telefone ?? '',
            email: inquilino.email ?? '',
            cpf: inquilino.cpf ?? '',
            observacoes: inquilino.observacoes ?? '',
          });
        }
        this.carregando.set(false);
      },
      error: (e: unknown) => {
        this.notificacao.erro(e);
        void this.router.navigate(['/inquilinos']);
      },
    });
  }

  /** Ao sair do campo, mostra o valor no formato "1.200,00". */
  protected formatarValor(): void {
    const controle = this.form.controls.valorAluguel;
    const api = valorParaApi(controle.value);
    if (api) controle.setValue(valorParaCampo(api));
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const opcional = (texto: string) => texto.trim() || null;
    const dados: DadosInquilino = {
      nome: v.nome.trim(),
      valorAluguel: valorParaApi(v.valorAluguel)!,
      diaVencimento: Number(v.diaVencimento),
      telefone: opcional(v.telefone),
      email: opcional(v.email),
      cpf: opcional(v.cpf),
      observacoes: opcional(v.observacoes),
    };
    const id = this.id();
    if (!id) {
      dados.imovelId = v.imovelId;
      dados.dataEntrada = paraIso(v.dataEntrada!);
    }

    this.enviando.set(true);
    this.erro.set('');
    const requisicao = id ? this.inquilinosApi.atualizar(id, dados) : this.inquilinosApi.criar(dados);
    requisicao.subscribe({
      next: (inquilino) => {
        this.notificacao.sucesso(id ? 'Dados do inquilino atualizados' : 'Inquilino cadastrado');
        void this.router.navigate(['/inquilinos', inquilino.id]);
      },
      error: (e: unknown) => {
        this.erro.set(mensagemDeErro(e));
        this.enviando.set(false);
      },
    });
  }
}
