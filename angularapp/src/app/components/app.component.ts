import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  template: `
    <div class="layout">
      <h2 class="title">Кредитный модуль (Angular)</h2>
      <nav class="nav">
        <a routerLink="/bank/credit" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Главная</a>
        <a routerLink="/bank/credit/details/123" routerLinkActive="active">Детали #123</a>
        <a routerLink="/bank/credit/details/456" routerLinkActive="active">Детали #456</a>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .layout { font: 14px/1.4 system-ui, sans-serif; padding: 12px; }
    .title { margin: 0 0 12px; font-size: 18px; }
    .nav { display: flex; gap: 12px; margin-bottom: 16px; }
    .nav a { text-decoration: none; color: #0366d6; }
    .nav a.active { font-weight: 600; color: #0a53b0; }
    .card { border: 1px solid #ddd; padding: 12px; border-radius: 6px; background:#fafafa }
  `]
})
export class AppComponent {}

