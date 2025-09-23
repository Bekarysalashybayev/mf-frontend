import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  template: `
    <div class="layout fade-in">
      <h2 class="title">Кредитный модуль (Angular)</h2>
      <nav class="nav" aria-label="Кредитная навигация">
        <a routerLink="/bank/credit" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Главная</a>
        <a routerLink="/bank/credit/details/123" routerLinkActive="active">Детали #123</a>
        <a routerLink="/bank/credit/details/456" routerLinkActive="active">Детали #456</a>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {}
