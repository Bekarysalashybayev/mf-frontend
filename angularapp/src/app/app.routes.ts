import { Routes } from '@angular/router';
import { CreditComponent } from './pages/credit/credit';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'bank/credit' },
];
  { path: 'bank/credit', component: CreditComponent },
  { path: '**', redirectTo: 'bank/credit' }
