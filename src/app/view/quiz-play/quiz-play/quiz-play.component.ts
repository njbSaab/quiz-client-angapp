import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz, Question } from '../../../core/interfaces/quiz.interface';
import { QuizService } from '../../../core/services/quiz.service';
import { TimerService } from '../../../core/services/timer.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-quiz-play',
  templateUrl: './quiz-play.component.html',
  styleUrls: ['./quiz-play.component.scss'],
  animations: [
    trigger('questionFadeIn', [
      transition(':increment', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate('1000ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('answersFadeIn', [
      transition(':increment', [
        query(
          '.quiz-play-answers-item',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate('700ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
          ],
          { optional: true }
        ),
      ]),
      transition(':leave', [
        query(
          '.quiz-play-answers-item',
          [
            stagger(50, [
              animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' })),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class QuizPlayComponent implements OnInit {
  quiz: Quiz | undefined;
  questions: Question[] = [];
  currentQuestionIndex: number = 0;
  correctAnswersCount: number = 0;
  totalPoints: number = 0;
  currentTime: number = 30;
  progress: number = 0;
  isAnswerVisible: boolean = true;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private timerService: TimerService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentQuestionIndex = 0;
    this.correctAnswersCount = 0;
    this.totalPoints = 0;

    this.timerService.currentTime$.subscribe((time) => {
      this.currentTime = time;
      if (time === 0) {
        this.goToNextQuestion();
      }
    });

    this.timerService.progress$.subscribe((progress) => {
      this.progress = progress;
    });

    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Quiz ID from route:', quizId);

    this.quizService.getQuizById(quizId).subscribe({
      next: (quiz) => {
        if (quiz) {
          this.quiz = quiz;
          // Проверяем, что вопросы содержат ответы
          if (quiz.questions.every((q) => q.answers && q.answers.length > 0)) {
            this.questions = quiz.questions;
          } else {
            console.error('Вопросы не содержат ответов:', quiz.questions);
            this.router.navigate(['/quizzes']);
            return;
          }

          const storedIndex = localStorage.getItem('currentQuestionIndex');
          const storedCorrectCount = localStorage.getItem('correctAnswersCount');
          const storedPoints = localStorage.getItem('totalPoints');

          this.currentQuestionIndex = storedIndex ? +storedIndex : 0;
          this.correctAnswersCount = storedCorrectCount ? +storedCorrectCount : 0;
          this.totalPoints = storedPoints ? +storedPoints : 0;

          this.timerService.startTimer();
        } else {
          console.error('Квиз не найден!');
          this.router.navigate(['/quizzes']);
        }
      },
      error: (error) => {
        console.error('Ошибка загрузки квиза:', error);
        this.router.navigate(['/quizzes']);
      }
    });
  }

  onAnswerSelect(answer: any): void {
    console.log('Выбранный ответ:', answer);

    if (answer.isCorrect) {
      this.correctAnswersCount++;
      this.totalPoints += answer.points || 1;
      localStorage.setItem('correctAnswersCount', this.correctAnswersCount.toString());
      localStorage.setItem('totalPoints', this.totalPoints.toString());
    }

    this.isAnswerVisible = false;

    setTimeout(() => {
      this.goToNextQuestion();
      this.isAnswerVisible = true;
    }, 500);
  }

  goToNextQuestion(): void {
    this.currentQuestionIndex++;
    localStorage.setItem('currentQuestionIndex', this.currentQuestionIndex.toString());

    if (this.currentQuestionIndex >= this.questions.length) {
      this.timerService.stopTimer();
      this.currentTime = 0;
      this.progress = 100;
      this.saveResults();
    } else {
      this.timerService.startTimer();
    }
  }

  resetProgress(): void {
    this.currentQuestionIndex = 0;
    this.correctAnswersCount = 0;
    this.totalPoints = 0;
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('correctAnswersCount');
    localStorage.removeItem('totalPoints');
    this.timerService.startTimer();
  }

  private saveResults(): void {
    if (this.quiz) {
      const result = {
        userId: 1, // Замените на реальный userId
        quizId: this.quiz.id,
        score: this.totalPoints,
        answers: this.questions.map((q, i) => ({
          questionId: q.id,
          selectedAnswer: i < this.currentQuestionIndex ? q.answers.find((a) => a.isCorrect)?.id : null
        }))
      };
      this.userService.addUserResult(result).subscribe({
        next: () => console.log('Результаты сохранены на сервере'),
        error: (error) => console.error('Ошибка сохранения результатов:', error)
      });
    }
  }
}