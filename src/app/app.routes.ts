import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./core/feature-dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'ligas',
    loadComponent: () => import('./fixtures/feature-ligas/ligas.component').then((m) => m.LigasComponent)
  },
  {
    path: 'ligas/:ligaId/equipes',
    loadComponent: () =>
      import('./fixtures/feature-equipes/equipes.component').then((m) => m.EquipesComponent)
  },
  {
    path: 'equipes/:equipeId/jogadores',
    loadComponent: () =>
      import('./fixtures/feature-jogadores/jogadores.component').then((m) => m.JogadoresComponent)
  },
  {
    path: 'partidas',
    loadComponent: () =>
      import('./fixtures/feature-partidas/partidas.component').then((m) => m.PartidasComponent)
  },
  {
    path: 'historico',
    loadComponent: () =>
      import('./fixtures/feature-historico/historico.component').then((m) => m.HistoricoComponent)
  },
  {
    path: 'jogadores',
    loadComponent: () =>
      import('./fixtures/feature-jogadores-index/jogadores-index.component').then(
        (m) => m.JogadoresIndexComponent
      )
  },
  {
    path: 'partidas/:id',
    loadComponent: () =>
      import('./fixtures/feature-partida-detalhe/partida-detalhe.component').then(
        (m) => m.PartidaDetalheComponent
      )
  },
  {
    path: 'partidas/:id/estatisticas',
    loadComponent: () =>
      import('./fixtures/feature-registrar-estatisticas/registrar-estatisticas.component').then(
        (m) => m.RegistrarEstatisticasComponent
      )
  },
  {
    path: 'analises',
    loadComponent: () => import('./analise/feature-analises/analises.component').then((m) => m.AnalisesComponent)
  },
  {
    // Precisa vir antes de 'analises/:id' — o router casa por ordem de declaração, não por
    // especificidade, então um segmento literal depois de um :param nunca seria alcançado.
    path: 'analises/medicao',
    loadComponent: () => import('./analise/feature-medicao/medicao.component').then((m) => m.MedicaoComponent)
  },
  {
    path: 'analises/:id',
    loadComponent: () =>
      import('./analise/feature-analise-detalhe/analise-detalhe.component').then((m) => m.AnaliseDetalheComponent)
  },
  {
    path: 'banca',
    loadComponent: () => import('./apostas/feature-banca/banca.component').then((m) => m.BancaComponent)
  },
  {
    path: 'apostas-multiplas',
    loadComponent: () =>
      import('./apostas/feature-apostas-multiplas/apostas-multiplas.component').then(
        (m) => m.ApostasMultiplasComponent
      )
  },
  {
    // Mesma regra: precisa vir antes de 'apostas-multiplas/:id'.
    path: 'apostas-multiplas/montar',
    loadComponent: () =>
      import('./apostas/feature-montar-multipla/montar-multipla.component').then((m) => m.MontarMultiplaComponent)
  },
  {
    path: 'apostas-multiplas/:id',
    loadComponent: () =>
      import('./apostas/feature-multipla-detalhe/multipla-detalhe.component').then(
        (m) => m.MultiplaDetalheComponent
      )
  },
  {
    path: 'alavancagem',
    loadComponent: () =>
      import('./apostas/feature-alavancagem/alavancagem.component').then((m) => m.AlavancagemComponent)
  },
  {
    path: 'aulas',
    loadComponent: () => import('./core/feature-aulas/aulas.component').then((m) => m.AulasComponent)
  }
];
