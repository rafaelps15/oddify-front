export enum DecisaoDoClaude {
  NaoAvaliada = 0,
  Confirma = 1,
  Reduz = 2,
  Veta = 3
}

export function labelDecisaoDoClaude(decisao: DecisaoDoClaude): string {
  switch (decisao) {
    case DecisaoDoClaude.Confirma:
      return 'Confirma';
    case DecisaoDoClaude.Reduz:
      return 'Reduz';
    case DecisaoDoClaude.Veta:
      return 'Veta';
    default:
      return 'Não avaliada';
  }
}

export function classeDecisaoDoClaude(decisao: DecisaoDoClaude): string {
  switch (decisao) {
    case DecisaoDoClaude.Confirma:
      return 'badge--good';
    case DecisaoDoClaude.Reduz:
      return 'badge--warning';
    case DecisaoDoClaude.Veta:
      return 'badge--critical';
    default:
      return 'badge--neutral';
  }
}
