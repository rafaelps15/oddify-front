import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

export interface NavItem {
  label: string;
  icon: string[]; // one or more SVG path "d" strings
  route?: string; // absent => no screen yet, item renders disabled
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly navItems: NavItem[] = [
    { label: 'Início', route: '/', icon: ['M3 11.5 12 4l9 7.5', 'M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9'] },
    { label: 'Apostas', route: '/apostas-multiplas', icon: ['M3 5h18v14H3z', 'M3 10h18', 'M8 15h3'] },
    { label: 'Ao vivo', route: '/partidas', icon: ['M12 5V2', 'M12 22v-3', 'M5 12H2', 'M22 12h-3', 'M6.3 6.3 4.2 4.2', 'M19.8 19.8l-2.1-2.1', 'M6.3 17.7l-2.1 2.1', 'M19.8 4.2l-2.1 2.1'] },
    {
      label: 'Oportunidades',
      route: '/analises',
      icon: ['M12 2v3', 'M12 19v3', 'M4.2 4.2l2.1 2.1', 'M17.7 17.7l2.1 2.1', 'M2 12h3', 'M19 12h3', 'M4.2 19.8l2.1-2.1', 'M17.7 6.3l2.1-2.1']
    },
    { label: 'Estatísticas', route: '/ligas', icon: ['M3 3v16a2 2 0 0 0 2 2h16', 'M7 15l4-5 3 3 5-7'] },
    { label: 'Jogadores', route: '/jogadores', icon: ['M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6', 'M16.5 14.2c2.8.4 5 2.5 5 5.3'] },
    { label: 'Alavancagem', route: '/alavancagem', icon: ['M3 17l6-6 4 4 8-8', 'M15 7h6v6'] },
    { label: 'Histórico', route: '/historico', icon: ['M12,3a9,9 0 1,0 0,18a9,9 0 1,0 0,-18', 'M12 7v5l3 3'] },
    { label: 'Performance', route: '/analises/medicao', icon: ['M4 20V10M11 20V4M18 20v-7'] },
    { label: 'Aulas', route: '/aulas', icon: ['M2 8l10-4 10 4-10 4z', 'M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5'] },
    { label: 'Banca', route: '/banca', icon: ['M3 10h18v10H3z', 'M7 10V6a5 5 0 0 1 10 0v4'] }
  ];
}
