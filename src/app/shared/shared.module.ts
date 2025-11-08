import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChangeBackgroundDirective } from './directives/change-background.directive';
import { RandomBackgroundDirective } from './directives/random-class.directive';
import { RouterLink, RouterModule } from '@angular/router';
import { BannerComponent } from './components/banner/banner.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ChangeBackgroundDirective,
    RandomBackgroundDirective,
    BannerComponent
  ],
  imports: [
    CommonModule,
    RouterLink,
    RouterModule,
    FormsModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    ChangeBackgroundDirective,
    RandomBackgroundDirective,
    BannerComponent
  ]
})
export class SharedModule { }
