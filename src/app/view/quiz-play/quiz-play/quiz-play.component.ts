import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz, Question } from '../../../core/interfaces/quiz.interface';
import { QuizService } from '../../../core/services/quiz.service';
import { TimerService } from '../../../core/services/timer.service';
import { UserService } from '../../../core/services/user.service';
import { UserResult, UserSessionData } from '../../../core/interfaces/user.interface';

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
  answers: { questionId: number; answerId: number | null }[] = [];
  isQuizFinished: boolean = false;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private timerService: TimerService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Quiz ID from route:', quizId);

    this.quizService.getQuizById(quizId).subscribe({
      next: (quiz) => {
        if (quiz) {
          this.quiz = quiz;
          if (quiz.questions.every((q) => q.answers && q.answers.length > 0)) {
            this.questions = quiz.questions;
          } else {
            console.error('Вопросы не содержат ответов:', quiz.questions);
            this.router.navigate(['/quizzes']);
            return;
          }

          // Загружаем данные из localStorage для конкретного quizId
          this.loadQuizSession(quizId);

          if (!this.isQuizFinished) {
            this.timerService.startTimer();
          } else {
            this.timerService.stopTimer();
            this.saveResults();
          }
          this.saveUserSession(quizId);
        } else {
          console.error('Квиз не найден!');
          this.router.navigate(['/quizzes']);
        }
      },
      error: (error) => {
        console.error('Ошибка загрузки квиза:', error);
        this.router.navigate(['/quizzes']);
      },
    });

    this.timerService.currentTime$.subscribe((time) => {
      this.currentTime = time;
      if (time <= 0 && !this.isQuizFinished) {
        this.onTimeExpired();
      }
    });

    this.timerService.progress$.subscribe((progress) => {
      this.progress = progress;
    });
  }

  private loadQuizSession(quizId: number): void {
    const storedQuizId = localStorage.getItem(`quiz_${quizId}_id`);
    const storedIndex = localStorage.getItem(`quiz_${quizId}_currentQuestionIndex`);
    const storedCorrectCount = localStorage.getItem(`quiz_${quizId}_correctAnswersCount`);
    const storedPoints = localStorage.getItem(`quiz_${quizId}_totalPoints`);
    const storedAnswers = localStorage.getItem(`quiz_${quizId}_answers`);

    // Проверяем, что данные относятся к текущему квизу
    if (storedQuizId === quizId.toString()) {
      this.currentQuestionIndex = storedIndex ? +storedIndex : 0;
      this.correctAnswersCount = storedCorrectCount ? +storedCorrectCount : 0;
      this.totalPoints = storedPoints ? +storedPoints : 0;
      this.answers = storedAnswers ? JSON.parse(storedAnswers) : [];
      this.isQuizFinished = this.currentQuestionIndex >= this.questions.length;
    } else {
      // Если данные относятся к другому квизу, сбрасываем сессию
      this.resetProgress(quizId);
    }
  }

  onAnswerSelect(answer: any): void {
    console.log('Выбранный ответ:', answer);

    if (answer.isCorrect) {
      this.correctAnswersCount++;
      this.totalPoints += answer.points || 1;
    }

    this.answers.push({
      questionId: this.questions[this.currentQuestionIndex].id,
      answerId: answer.id,
    });

    // Сохраняем данные с привязкой к quizId
    localStorage.setItem(`quiz_${this.quiz!.id}_id`, this.quiz!.id.toString());
    localStorage.setItem(`quiz_${this.quiz!.id}_correctAnswersCount`, this.correctAnswersCount.toString());
    localStorage.setItem(`quiz_${this.quiz!.id}_totalPoints`, this.totalPoints.toString());
    localStorage.setItem(`quiz_${this.quiz!.id}_answers`, JSON.stringify(this.answers));

    this.timerService.stopTimer();
    this.saveUserSession(this.quiz!.id);

    this.isAnswerVisible = false;

    setTimeout(() => {
      this.currentQuestionIndex++;
      localStorage.setItem(`quiz_${this.quiz!.id}_currentQuestionIndex`, this.currentQuestionIndex.toString());
      this.goToNextQuestion();
      this.isAnswerVisible = true;
    }, 500);
  }

  private onTimeExpired(): void {
    this.answers.push({
      questionId: this.questions[this.currentQuestionIndex].id,
      answerId: null,
    });

    localStorage.setItem(`quiz_${this.quiz!.id}_answers`, JSON.stringify(this.answers));
    this.saveUserSession(this.quiz!.id);

    this.timerService.stopTimer();
    this.isAnswerVisible = false;

    setTimeout(() => {
      this.currentQuestionIndex++;
      localStorage.setItem(`quiz_${this.quiz!.id}_currentQuestionIndex`, this.currentQuestionIndex.toString());
      this.goToNextQuestion();
      this.isAnswerVisible = true;
    }, 500);
  }

  goToNextQuestion(): void {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.isQuizFinished = true;
      this.timerService.stopTimer();
      this.currentTime = 0;
      this.progress = 100;
      localStorage.setItem(`quiz_${this.quiz!.id}_answers`, JSON.stringify(this.answers));
      localStorage.setItem(`quiz_${this.quiz!.id}_completed`, 'true');
      this.saveResults();
    } else {
      this.timerService.startTimer();
      this.saveUserSession(this.quiz!.id);
    }
  }

  resetProgress(quizId?: number): void {
    const id = quizId || this.quiz!.id;
    this.currentQuestionIndex = 0;
    this.correctAnswersCount = 0;
    this.totalPoints = 0;
    this.answers = [];
    this.isQuizFinished = false;
    localStorage.setItem(`quiz_${id}_id`, id.toString());
    localStorage.removeItem(`quiz_${id}_currentQuestionIndex`);
    localStorage.removeItem(`quiz_${id}_correctAnswersCount`);
    localStorage.removeItem(`quiz_${id}_totalPoints`);
    localStorage.removeItem(`quiz_${id}_answers`);
    localStorage.removeItem(`quiz_${id}_completed`);
    this.timerService.startTimer();
    this.saveUserSession(id);
  }

  getResults(): void {
    this.router.navigate(['/quiz', this.quiz!.id, 'result']);
  }

  private async saveUserSession(quizId: number): Promise<void> {
    const browserInfo: any = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: { width: window.screen.width, height: window.screen.height },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookiesEnabled: navigator.cookieEnabled,
      platform: navigator.platform,
      referrer: document.referrer,
      ipAddress: await this.getIpAddress(),
      geolocation: undefined,
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          browserInfo.geolocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.sendSessionData(quizId, browserInfo);
        },
        (error) => {
          console.warn('Геолокация не получена:', error);
          this.sendSessionData(quizId, browserInfo);
        }
      );
    } else {
      this.sendSessionData(quizId, browserInfo);
    }
  }

  private async getIpAddress(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Не удалось получить IP:', error);
      return undefined;
    }
  }

  private sendSessionData(quizId: number, browserInfo: any): void {
    const sessionData: UserSessionData = {
      quizId,
      sessionId: this.userService.getSessionId(),
      userId: this.userService.getUserId() || null,
      currentQuestionIndex: this.currentQuestionIndex,
      correctAnswersCount: this.correctAnswersCount,
      totalPoints: this.totalPoints,
      answers: this.answers,
      browserInfo,
    };

    this.userService.saveUserSession(sessionData).subscribe({
      next: (response) => {
        console.log('Сессия сохранена:', response);
        if (response.userId) {
          localStorage.setItem('userId', response.userId);
        }
      },
      error: (error) => {
        console.error('Ошибка сохранения сессии:', error);
      },
    });
  }

  private saveResults(): void {
    if (this.quiz) {
      const result: UserResult = {
        quizId: this.quiz.id,
        sessionId: this.userService.getSessionId(),
        userId: this.userService.getUserId() || null,
        score: this.totalPoints,
        answers: this.answers.filter((answer) => answer.answerId !== null) as {
          questionId: number;
          answerId: number;
        }[],
      };

      this.userService.addUserResult(result).subscribe({
        next: () => console.log('Результаты сохранены на сервере'),
        error: (error) => console.error('Ошибка сохранения результатов:', error),
      });
    }
  }
}