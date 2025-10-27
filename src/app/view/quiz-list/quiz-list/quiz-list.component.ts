import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { QuizService } from '../../../core/services/quiz.service';
import { UserService } from '../../../core/services/user.service';
import { Quiz } from '../../../core/interfaces/quiz.interface';
import { UserSessionData } from '../../../core/interfaces/user.interface';

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
  private hasSessionSaved: boolean = false; // Флаг для предотвращения дублирования

  constructor(
    private quizService: QuizService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
    if (!this.hasSessionSaved) {
      this.saveUserSession();
      this.hasSessionSaved = true;
    }
  }

  loadQuizzes(): void {
    this.quizService.getQuizzes().subscribe({
      next: (data: Quiz[]) => {
        console.log('Полученные данные с сервера:', data);
        this.quizzes = data.filter((quiz) => quiz.isActive);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Ошибка загрузки квизов:', error);
        this.cdr.markForCheck();
      },
    });
  }

  async saveUserSession(): Promise<void> {
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
          this.sendSessionData(browserInfo);
        },
        (error) => {
          console.warn('Геолокация не получена:', error);
          this.sendSessionData(browserInfo);
        }
      );
    } else {
      this.sendSessionData(browserInfo);
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

  private sendSessionData(browserInfo: any): void {
    const sessionData: UserSessionData = {
      quizId: 0, // Используем 0 для списка квизов, но лучше уточнить логику
      sessionId: this.userService.getSessionId(),
      userId: this.userService.getUserId() || null,
      currentQuestionIndex: 0,
      correctAnswersCount: 0,
      totalPoints: 0,
      answers: [],
      browserInfo,
    };

    this.userService.saveUserSession(sessionData);
  }
}