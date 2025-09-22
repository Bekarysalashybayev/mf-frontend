import { Routes } from '@angular/router';
import { CreditComponent } from './pages/credit/credit';
import { CreditTransferComponent } from './pages/credit/credit-transfer';

export const routes: Routes = [
  { path: 'bank/credit/transfer', component: CreditTransferComponent },
  { path: 'bank/credit', component: CreditComponent },
  { path: '**', redirectTo: 'bank/credit' }
];
