import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Avatar } from '../compartilhado/avatar/avatar';
import { Logo } from '../compartilhado/logo/logo';
import { AuthService } from '../core/auth/auth.service';

interface ItemMenu {
  rota: string;
  rotulo: string;
  icone: string;
  exato: boolean;
}

/** Estrutura das telas internas: menu lateral (gaveta no celular) + conteúdo. */
@Component({
  selector: 'q-layout-interno',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatButtonModule,
    MatTooltipModule,
    Logo,
    Avatar,
  ],
  templateUrl: './layout-interno.html',
  styleUrl: './layout-interno.scss',
})
export class LayoutInterno implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly menu = viewChild.required(MatSidenav);

  protected readonly celular = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 767.98px)')
      .pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  protected readonly itens: ItemMenu[] = [
    { rota: '/', rotulo: 'Painel', icone: 'grid_view', exato: true },
    { rota: '/imoveis', rotulo: 'Imóveis', icone: 'apartment', exato: false },
    { rota: '/inquilinos', rotulo: 'Inquilinos', icone: 'groups', exato: false },
  ];

  constructor() {
    // No celular, a gaveta fecha ao trocar de tela.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this.celular()) void this.menu().close();
      });
  }

  ngOnInit(): void {
    this.auth.carregarProprietario();
  }
}
