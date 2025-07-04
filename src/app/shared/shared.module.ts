import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChangeBackgroundDirective } from './directives/change-background.directive';
import { RandomBackgroundDirective } from './directives/random-class.directive';
import { RouterLink, RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ChangeBackgroundDirective,
    RandomBackgroundDirective
  ],
  imports: [
    CommonModule,
    RouterLink,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    ChangeBackgroundDirective,
    RandomBackgroundDirective
  ]
})
export class SharedModule { }
