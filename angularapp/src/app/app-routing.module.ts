import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CreditHomeComponent } from './components/credit-home.component'
import { CreditDetailsComponent } from './components/credit-details.component'

const routes: Routes = [
  {
    path: 'bank/credit',
    children: [
      { path: '', pathMatch: 'full', component: CreditHomeComponent },
      { path: 'details/:id', component: CreditDetailsComponent }
    ]
  },
  { path: '**', redirectTo: 'bank/credit' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}

