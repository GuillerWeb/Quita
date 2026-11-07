import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DadosImovel,
  DadosInquilino,
  Imovel,
  Inquilino,
  InquilinoDaLista,
  InquilinoDetalhe,
  Pagamento,
  Painel,
} from './modelos';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ImoveisApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Imovel[]> {
    return this.http.get<Imovel[]>(`${API}/imoveis`);
  }

  buscar(id: string): Observable<Imovel> {
    return this.http.get<Imovel>(`${API}/imoveis/${id}`);
  }

  criar(dados: DadosImovel): Observable<Imovel> {
    return this.http.post<Imovel>(`${API}/imoveis`, dados);
  }

  atualizar(id: string, dados: DadosImovel): Observable<Imovel> {
    return this.http.patch<Imovel>(`${API}/imoveis/${id}`, dados);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/imoveis/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class InquilinosApi {
  private readonly http = inject(HttpClient);

  listar(ativos: 'true' | 'false' | 'todos' = 'true'): Observable<InquilinoDaLista[]> {
    return this.http.get<InquilinoDaLista[]>(`${API}/inquilinos`, { params: { ativos } });
  }

  buscar(id: string): Observable<InquilinoDetalhe> {
    return this.http.get<InquilinoDetalhe>(`${API}/inquilinos/${id}`);
  }

  criar(dados: DadosInquilino): Observable<InquilinoDetalhe> {
    return this.http.post<InquilinoDetalhe>(`${API}/inquilinos`, dados);
  }

  atualizar(id: string, dados: DadosInquilino): Observable<Inquilino> {
    return this.http.patch<Inquilino>(`${API}/inquilinos/${id}`, dados);
  }

  registrarSaida(id: string, dataSaida: string): Observable<InquilinoDetalhe> {
    return this.http.post<InquilinoDetalhe>(`${API}/inquilinos/${id}/saida`, { dataSaida });
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/inquilinos/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class PagamentosApi {
  private readonly http = inject(HttpClient);

  pagar(id: string, dataPagamento: string): Observable<Pagamento> {
    return this.http.patch<Pagamento>(`${API}/pagamentos/${id}/pagar`, { dataPagamento });
  }

  desfazer(id: string): Observable<Pagamento> {
    return this.http.patch<Pagamento>(`${API}/pagamentos/${id}/desfazer`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class PainelApi {
  private readonly http = inject(HttpClient);

  carregar(): Observable<Painel> {
    return this.http.get<Painel>(`${API}/painel`);
  }
}
