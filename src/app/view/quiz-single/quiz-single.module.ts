import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizSingleComponent } from './quiz-single/quiz-single.component';
import { RouterLink, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: QuizSingleComponent },
];

@NgModule({
  declarations: [
    QuizSingleComponent // Объявляем компонент
  ],
  imports: [
    CommonModule, // Импортируем CommonModule для структурных директив
    RouterModule.forChild(routes), // Определяем маршруты прямо здесь
    RouterLink
  ],
  exports: [
    QuizSingleComponent,
    RouterModule
  ]
})
export class QuizSingleModule { }
