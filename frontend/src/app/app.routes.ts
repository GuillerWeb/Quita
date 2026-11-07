import { Routes } from '@angular/router';
import { authGuard, visitanteGuard } from './core/auth/guardas';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [visitanteGuard],
    title: 'Entrar — Quita',
    loadComponent: () => import('./paginas/acesso/login').then((m) => m.Login),
  },
  {
    path: 'cadastro',
    canActivate: [visitanteGuard],
    title: 'Criar conta — Quita',
    loadComponent: () => import('./paginas/acesso/cadastro').then((m) => m.Cadastro),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout-interno').then((m) => m.LayoutInterno),
    children: [
      {
        path: '',
        title: 'Painel — Quita',
        loadComponent: () => import('./paginas/painel/painel').then((m) => m.Painel),
      },
      {
        path: 'imoveis',
        title: 'Imóveis — Quita',
        loadComponent: () => import('./paginas/imoveis/lista-imoveis').then((m) => m.ListaImoveis),
      },
      {
        path: 'imoveis/novo',
        title: 'Cadastrar imóvel — Quita',
        loadComponent: () =>
          import('./paginas/imoveis/formulario-imovel').then((m) => m.FormularioImovel),
      },
      {
        path: 'imoveis/:id/editar',
        title: 'Editar imóvel — Quita',
        loadComponent: () =>
          import('./paginas/imoveis/formulario-imovel').then((m) => m.FormularioImovel),
      },
      {
        path: 'inquilinos',
        title: 'Inquilinos — Quita',
        loadComponent: () =>
          import('./paginas/inquilinos/lista-inquilinos').then((m) => m.ListaInquilinos),
      },
      {
        path: 'inquilinos/novo',
        title: 'Cadastrar inquilino — Quita',
        loadComponent: () =>
          import('./paginas/inquilinos/formulario-inquilino').then((m) => m.FormularioInquilino),
      },
      {
        path: 'inquilinos/:id/editar',
        title: 'Editar inquilino — Quita',
        loadComponent: () =>
          import('./paginas/inquilinos/formulario-inquilino').then((m) => m.FormularioInquilino),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
