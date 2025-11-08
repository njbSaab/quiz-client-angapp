import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { RouterLink, RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: QuizListComponent },
];

@NgModule({
  declarations: [
    QuizListComponent, // Регистрация компонента
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes), // Определяем маршруты прямо здесь
  ],
  exports: [
    QuizListComponent, // Экспорт компонента, если потребуется
  ],
})
export class QuizListModule {}
