import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataJudResponse, ProcessoFiltros } from '../models/datajud.model';

@Injectable({
    providedIn: 'root'
})
export class DatajudService {
    private readonly BASE_URL = `/api`;

    constructor(private http: HttpClient) { }

    private construirUrl(tribunal?: string, endpoint: string = '_search'): string {
        const tribunalPath = tribunal || 'api_publica_trf1';
        return `${this.BASE_URL}/${tribunalPath}/${endpoint}`;
    }

    buscarProcessos(filtros: ProcessoFiltros = {}, size: number = 50): Observable<DataJudResponse> {
        const query = this.construirQueryElasticsearch(filtros, size);

        let url: string;
        if (filtros.tribunal) {
            url = this.construirUrl(filtros.tribunal);
        } else {
            url = this.construirUrl('api_publica_trf1');
        }

        return this.http.post<DataJudResponse>(url, query);
    }

    buscarTotalProcessos(tribunal?: string): Observable<{ total: number }> {
        const url = this.construirUrl(tribunal || 'api_publica_trf1', '_count');
        return this.http.post<{ count: number }>(url, {}).pipe(
            map((response: { count: number }) => ({
                total: response.count || 0
            }))
        );
    }

    buscarProcessosHoje(tribunal?: string): Observable<{ total: number }> {
        const hoje = new Date();
        const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0, 0);
        const dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);

        const query = {
            query: {
                range: {
                    '@timestamp': {
                        gte: dataInicio.toISOString(),
                        lte: dataFim.toISOString()
                    }
                }
            }
        };

        const url = this.construirUrl(tribunal || 'api_publica_trf1', '_count');
        return this.http.post<{ count: number }>(url, query).pipe(
            map((response: { count: number }) => ({
                total: response.count || 0
            }))
        );
    }

    buscarProcessosEsteMes(tribunal?: string): Observable<{ total: number }> {
        const hoje = new Date();
        const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0, 0);
        const dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);

        const query = {
            query: {
                range: {
                    '@timestamp': {
                        gte: dataInicio.toISOString(),
                        lte: dataFim.toISOString()
                    }
                }
            }
        };

        const url = this.construirUrl(tribunal || 'api_publica_trf1', '_count');
        return this.http.post<{ count: number }>(url, query).pipe(
            map((response: { count: number }) => ({
                total: response.count || 0
            }))
        );
    }

    private construirQueryElasticsearch(filtros: ProcessoFiltros, size: number = 50): any {
        const must: any[] = [];

        if (filtros.termoBusca && filtros.termoBusca.trim()) {
            must.push({
                match: {
                    numeroProcesso: {
                        query: filtros.termoBusca,
                        operator: 'and'
                    }
                }
            });
        }

        const query: any = {
            size: size,
            sort: [
                {
                    '@timestamp': {
                        order: 'desc'
                    }
                }
            ]
        };

        if (must.length > 0) {
            query.query = { bool: { must } };
        }

        return query;
    }

    mapearProcessoParaInterface(dataJudProcesso: any): any {
        const source = dataJudProcesso._source;

        let assuntosPrincipais = 'Não informado';
        if (source.assuntos && source.assuntos.length > 0) {
            assuntosPrincipais = source.assuntos.map((assunto: any) => assunto.nome).join(', ');
        }

        return {
            numero: source.numeroProcesso,
            grau: source.grau || 'Não informado',
            classeJudicial: source.classe?.nome || 'Não informado',
            assuntosPrincipais: assuntosPrincipais,
            comarca: source.orgaoJulgador?.nome || 'Não informado'
        };
    }


} 