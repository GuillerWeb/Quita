import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Rotas internas: exige estar logado. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.logado() || inject(Router).createUrlTree(['/login']);
};

/** Login e cadastro: quem já está logado vai direto para o painel. */
export const visitanteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return !auth.logado() || inject(Router).createUrlTree(['/']);
};
