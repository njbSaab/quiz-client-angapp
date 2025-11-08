import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsComponent } from './terms/terms.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: TermsComponent },
];

@NgModule({
  declarations: [
    TermsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes), 
  ]
})
export class TermsModule { }
