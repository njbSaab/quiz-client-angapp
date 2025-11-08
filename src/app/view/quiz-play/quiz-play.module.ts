import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Routes } from '@angular/router';
import { QuizPlayComponent } from './quiz-play/quiz-play.component';
import { SharedModule } from '../../shared/shared.module';
import { QuizFinishedComponent } from './quiz-finished/quiz-finished.component';

const routes: Routes = [
  { path: '', component: QuizPlayComponent },
];

@NgModule({
  declarations: [QuizPlayComponent, QuizFinishedComponent], // Убедитесь, что компонент здесь
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule, 
    RouterLink,
  ],
  exports: [RouterModule, QuizPlayComponent],
})
export class QuizPlayModule {}
