import { Component } from '@angular/core'

@Component({
  selector: 'app-credit-home',
  template: `
    <div class="card">
      <h3>Кредитные продукты</h3>
      <p>Добро пожаловать в кредитный модуль. Выберите один из кредитов слева в меню или откройте детали напрямую:</p>
      <ul>
        <li><a routerLink="/bank/credit/details/1001">Кредит #1001</a></li>
        <li><a routerLink="/bank/credit/details/1002">Кредит #1002</a></li>
        <li><a routerLink="/bank/credit/details/1003">Кредит #1003</a></li>
      </ul>
    </div>
  `
})
export class CreditHomeComponent {}

