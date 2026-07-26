import { ResultadoDaAposta } from './resultado-da-aposta';

export interface ApostaMultipla {
  id: string;
  bancaId: string;
  oddCombinada: number;
  stake: number;
  resultado: ResultadoDaAposta;
  lucroOuPerda: number | null;
  criadaEmUtc: string;
}
