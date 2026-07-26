export enum SituacaoDaPartida {
  Agendada = 0,
  Encerrada = 1,
  Liquidada = 2
}

export interface Partida {
  id: string;
  idExterno: string;
  ligaId: string;
  equipeCasaId: string;
  equipeVisitanteId: string;
  dataUtc: string;
  situacao: SituacaoDaPartida;
  golsCasa: number | null;
  golsVisitante: number | null;
}

export interface HistoricoDeEquipe {
  amostraDeJogos: number;
  mediaGolsFeitos: number;
  mediaGolsSofridos: number;
}
