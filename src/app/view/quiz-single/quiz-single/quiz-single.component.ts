import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Quiz } from '../../../core/interfaces/quiz.interface';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-single',
  templateUrl: './quiz-single.component.html',
  styleUrls: ['./quiz-single.component.scss'],
  animations: [
    trigger('blurIn', [
      transition(':enter', [
        query(
          '.rounded-box',
          [
            style({ opacity: 0, filter: 'blur(10px)' }),
            stagger(150, [
              animate('700ms ease-in-out', style({ opacity: 1, filter: 'blur(0px)' })),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class QuizSingleComponent implements OnInit {
  quiz: Quiz | null = null;
  isQuizCompleted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadQuiz(+id);
      this.checkQuizCompletion(+id);
    }
  }

  loadQuiz(id: number): void {
    this.quizService.getQuizById(id).subscribe({
      next: (quiz) => {
        this.quiz = quiz || null;
      },
      error: (error) => {
        console.error('Ошибка загрузки квиза:', error);
      },
    });
  }

  checkQuizCompletion(quizId: number): void {
    this.isQuizCompleted = localStorage.getItem(`quiz_${quizId}_completed`) === 'true';
  }

  isArrow: boolean = false;

  arrowShow(): void {
    this.isArrow = true;
  }

  arrowHide(): void {
    this.isArrow = false;
  }
}