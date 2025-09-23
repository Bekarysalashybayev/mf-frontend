import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './components/app.component'
import { CreditHomeComponent } from './components/credit-home.component'
import { CreditDetailsComponent } from './components/credit-details.component'

@NgModule({
  declarations: [AppComponent, CreditHomeComponent, CreditDetailsComponent],
  imports: [BrowserModule, RouterModule, AppRoutingModule],
  bootstrap: [AppComponent]
})
export class AppModule {}

