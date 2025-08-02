export interface DataJudResponse {
    took: number;
    timed_out: boolean;
    _shards: {
        total: number;
        successful: number;
        skipped: number;
        failed: number;
    };
    hits: {
        total: {
            value: number;
            relation: string;
        };
        max_score: number;
        hits: Array<{
            _index: string;
            _id: string;
            _score: number;
            _source: {
                numeroProcesso: string;
                classe: {
                    codigo: number;
                    nome: string;
                };
                sistema: {
                    codigo: number;
                    nome: string;
                };
                formato: {
                    codigo: number;
                    nome: string;
                };
                tribunal: string;
                dataHoraUltimaAtualizacao: string;
                grau: string;
                '@timestamp': string;
                dataAjuizamento: string;
                movimentos: Array<{
                    codigo: number;
                    nome: string;
                    dataHora: string;
                    complementosTabelados?: Array<{
                        codigo: number;
                        valor: number;
                        nome: string;
                        descricao: string;
                    }>;
                }>;
                id: string;
                nivelSigilo: number;
                orgaoJulgador: {
                    codigoMunicipioIBGE: number;
                    codigo: number;
                    nome: string;
                };
                assuntos: Array<{
                    codigo: number;
                    nome: string;
                }>;
            };
        }>;
    };
}

export interface ProcessoFiltros {
    tribunal?: string;
    tipoJustica?: string;
    termoBusca?: string;
}

export interface Processo {
    numero: string;
    grau: string;
    classeJudicial: string;
    assuntosPrincipais: string;
    comarca: string;
} 