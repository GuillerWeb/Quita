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
    children: [
      {
        path: '',
        title: 'Painel — Quita',
        loadComponent: () => import('./paginas/painel/painel').then((m) => m.Painel),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
