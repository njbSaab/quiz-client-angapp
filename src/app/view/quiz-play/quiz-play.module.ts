import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Routes } from '@angular/router';
import { QuizPlayComponent } from './quiz-play/quiz-play.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: QuizPlayComponent },
];

@NgModule({
  declarations: [QuizPlayComponent], // Убедитесь, что компонент здесь
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule, // Если есть SharedModule
    RouterLink,
  ],
  exports: [RouterModule, QuizPlayComponent],
})
export class QuizPlayModule {}
