import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditComponent } from './credit';

describe('CreditComponent', () => {
  let component: CreditComponent;
  let fixture: ComponentFixture<CreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have credit offers', () => {
    expect(component.creditOffers.length).toBeGreaterThan(0);
  });

  it('should call applyForCredit with correct id', () => {
    spyOn(window, 'alert');
    component.applyForCredit(1);
    expect(window.alert).toHaveBeenCalledWith('Подача заявки на кредит #1');
  });
});
