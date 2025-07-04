import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: AboutComponent },
];

@NgModule({
  declarations: [
    AboutComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes), // Определяем маршруты прямо здесь

  ],
  exports: [AboutComponent]
})
export class AboutModule { }
