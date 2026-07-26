import { DecisaoDoClaude } from './decisao-do-claude';

export interface Analise {
  id: string;
  partidaId: string;
  mercado: string;
  probPoissonPura: number;
  probDixonColes: number;
  probImplicitaDaOdd: number;
  vantagem: number;
  oddDeMercado: number;
  aprovadaNoFiltro: boolean;
  motivoDoDescarte: string | null;
  decisaoDoClaude: DecisaoDoClaude;
  justificativaDoClaude: string | null;
  versaoDoPrompt: string | null;
  criadaEmUtc: string;
}
