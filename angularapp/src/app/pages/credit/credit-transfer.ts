import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-credit-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credit-transfer.html',
  styleUrl: './credit-transfer.scss'
})
export class CreditTransferComponent {
  title = 'Перевод по кредиту';

  model = {
    fromAccount: '',
    toAccount: '',
    amount: 0,
    comment: ''
  };

  submitted = false;

  submit() {
    this.submitted = true;
    // Простейшая имитация отправки
    setTimeout(() => {
      alert(`Перевод выполнен:\nС аккаунта: ${this.model.fromAccount}\nНа аккаунт: ${this.model.toAccount}\nСумма: ${this.model.amount} ₽`);
    }, 200);
  }

  navigate(path: string) {
    window.dispatchEvent(new CustomEvent('mf:navigate', { detail: { path } }));
  }
}

export default CreditTransferComponent;
