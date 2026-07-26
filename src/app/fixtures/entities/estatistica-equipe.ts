/** Formato de registro (POST) — o backend não expõe leitura para este agregado. */
export interface EstatisticaEquipe {
  partidaId: string;
  equipeId: string;
  gols: number;
  finalizacoes: number;
  escanteios: number;
  posse: number;
}
