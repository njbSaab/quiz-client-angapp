import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoliceComponent } from './police/police.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: PoliceComponent },
];


@NgModule({
  declarations: [
    PoliceComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
})
export class PoliceModule { }
