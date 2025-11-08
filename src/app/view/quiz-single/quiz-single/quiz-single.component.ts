// quiz-single.component.ts
import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Quiz } from '../../../core/interfaces/quiz.interface';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { UserService } from '../../../core/services/user.service';
import { v4 as uuidv4 } from 'uuid';
import { ScrollTopService } from '../../../core/services/scroll-top.service';

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
    private quizService: QuizService,
    private userService: UserService,
    private scrollTop: ScrollTopService,
    
  ) {}

  ngOnInit(): void {
    this.scrollTop.toTop();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const quizId = +id;
      this.loadQuiz(quizId);
      this.checkQuizCompletion(quizId);
      this.startQuizSession(quizId); // ← СОЗДАЁМ СЕССИЮ ЗДЕСЬ
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

  // === НОВАЯ ЛОГИКА: СОЗДАНИЕ СЕССИИ ===
private async startQuizSession(quizId: number): Promise<void> {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = uuidv4();
  }

  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = uuidv4();
  }

  // УСТАНАВЛИВАЕМ В СЕРВИС
  this.userService.setSessionId(sessionId);
  this.userService.setUserId(userId);

  const browserInfo = await this.getBrowserInfo();

  const sessionData = {
    quizId,
    sessionId,
    userId,
    currentQuestionIndex: 0,
    correctAnswersCount: 0,
    totalPoints: 0,
    answers: [],
    browserInfo,
  };

  this.userService.saveUserSession(sessionData);
}

  private async getBrowserInfo(): Promise<any> {
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

    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            browserInfo.geolocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            resolve(browserInfo);
          },
          () => {
            resolve(browserInfo); // без геолокации
          },
          { timeout: 5000 }
        );
      } else {
        resolve(browserInfo);
      }
    });
  }

  private async getIpAddress(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }

  isArrow: boolean = false;
  arrowShow(): void { this.isArrow = true; }
  arrowHide(): void { this.isArrow = false; }
}