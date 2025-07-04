import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizResultComponent } from './quiz-result/quiz-result.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: QuizResultComponent },
];


@NgModule({
  declarations: [
    QuizResultComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  exports: [
    QuizResultComponent
  ]
})
export class QuizResultModule { }
