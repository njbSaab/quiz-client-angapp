import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz } from '../../../core/interfaces/quiz.interface';

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('.quiz-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ]),
      ]),
    ]),
  ],
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getQuizzes().subscribe({
      next: (data: Quiz[]) => {
        console.log('Полученные данные с сервера:', data);
        this.quizzes = data.filter((quiz) => quiz.isActive);
      },
      error: (error) => {
        console.error('Ошибка загрузки квизов:', error);
      },
    });
  }
}