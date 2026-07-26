/** Formato de registro (POST) — o backend não expõe leitura para este agregado. */
export interface EstatisticaJogador {
  partidaId: string;
  jogadorId: string;
  gols: number;
  assistencias: number;
  minutos: number;
  titular: boolean;
  nota: number;
}
