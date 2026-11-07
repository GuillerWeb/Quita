import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/** Envia o token para a API e, se a sessão expirar (401), volta para o login. */
export const interceptorAuth: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const paraApi = req.url.startsWith(environment.apiUrl);

  const requisicao =
    token && paraApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      const tentativaDeLogin = req.url.endsWith('/auth/login') || req.url.endsWith('/auth/cadastro');
      if (erro instanceof HttpErrorResponse && erro.status === 401 && paraApi && !tentativaDeLogin) {
        auth.limparSessao();
        void router.navigate(['/login']);
      }
      return throwError(() => erro);
    }),
  );
};
