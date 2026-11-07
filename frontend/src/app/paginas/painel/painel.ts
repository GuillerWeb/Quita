import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'q-painel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="pagina"><h1 class="titulo-pagina">Painel</h1></div>`,
})
export class Painel {}
