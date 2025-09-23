import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-credit-details',
  template: `
    <div class="card">
      <h3>Детали кредита № {{ creditId$ | async }}</h3>
      <p>Это пример страницы деталей кредита. Навигация синхронизируется с хостом.</p>
      <button (click)="goBack()">Назад</button>
    </div>
  `
})
export class CreditDetailsComponent {
  creditId$!: Observable<string | null>
  constructor(private route: ActivatedRoute) {
    this.creditId$ = this.route.paramMap.pipe(map(p => p.get('id')))
  }
  goBack() { history.back() }
}
