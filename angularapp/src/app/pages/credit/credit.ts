import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-credit',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './credit.html',
  styleUrl: './credit.scss'
})
export class CreditComponent {
  title = 'Кредитная страница';

  creditOffers = [
    {
      id: 1,
      name: 'Потребительский кредит',
      rate: '15.5%',
      amount: 'до 3 000 000 ₽',
      description: 'Кредит на любые цели без поручителей'
    },
    {
      id: 2,
      name: 'Автокредит',
      rate: '12.9%',
      amount: 'до 5 000 000 ₽',
      description: 'Кредит на покупку нового или подержанного автомобиля'
    },
    {
      id: 3,
      name: 'Ипотека',
      rate: '8.5%',
      amount: 'до 15 000 000 ₽',
      description: 'Ипотечный кредит на покупку недвижимости'
    }
  ];

  applyForCredit(creditId: number) {
    alert(`Подача заявки на кредит #${creditId}`);
  }

  navigate(path: string) {
    window.dispatchEvent(new CustomEvent('mf:navigate', { detail: { path } }));
  }
}

// Экспортируем компонент как default для Module Federation
export default CreditComponent;
