import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { UserSessionData, UserResult } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private sessionId: string | null = null;
  private userId: string | null = null;

  // Subjects для сессий и результатов
  private sessionSubject = new Subject<UserSessionData>();
  private resultSubject = new Subject<UserResult>();

  // Хэш-сет для дедупликации по содержимому
  private processedSessionKeys = new Set<string>();
  private processedResultKeys = new Set<string>();

  constructor(private http: HttpClient) {
    this.sessionId = localStorage.getItem('sessionId') || null;
    this.userId = localStorage.getItem('userId') || null;

    if (!this.sessionId) {
      this.sessionId = uuidv4();
      localStorage.setItem('sessionId', this.sessionId);
    }

    if (this.userId) {
      this.validateUserId().subscribe({
        next: (valid) => {
          if (!valid) {
            this.userId = null;
            localStorage.removeItem('userId');
          }
        },
        error: (error) => {
          console.error('Ошибка проверки userId:', error);
          this.userId = null;
          localStorage.removeItem('userId');
        },
      });
    }

    // Дебounce + дедупликация по содержимому
    this.sessionSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe((sessionData) => this.sendSessionRequest(sessionData));

    this.resultSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe((result) => this.sendResultRequest(result));
  }

  private validateUserId(): Observable<boolean> {
    if (!this.userId) {
      return of(true);
    }
    return this.http
      .get(`${this.apiUrl}/users/${this.userId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map(() => true),
        catchError((error) => {
          if (error.status === 404) {
            return of(false);
          }
          throw error;
        })
      );
  }

  // Единые заголовки без X-Request-Id
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-Secret-Word': 'TOPWINNER_TOP_QUIZWIZ_WORLD',
    });
  }

  getSessionId(): string {
    return this.sessionId!;
  }

  getUserId(): string | null {
    return this.userId;
  }
  setSessionId(id: string): void {
    this.sessionId = id;
    localStorage.setItem('sessionId', id);
  }

  setUserId(id: string): void {
    this.userId = id;
    localStorage.setItem('userId', id);
  }

  // Сохранение сессии
  saveUserSession(sessionData: UserSessionData): void {
    sessionData.sessionId = this.sessionId!;
    sessionData.userId = this.userId || null;

    const key = JSON.stringify(sessionData);
    if (this.processedSessionKeys.has(key)) {
      console.log('Сессия уже отправлена (дубликат), пропускаем.');
      return;
    }
    this.processedSessionKeys.add(key);

    this.sessionSubject.next(sessionData);
  }

private sendSessionRequest(sessionData: UserSessionData): void {
  this.http
    .post(`${this.apiUrl}/users/session`, sessionData, {
      headers: this.getHeaders(),
    })
    .pipe(
      map((response: any) => {
        if (response.session?.sessionId) {
          this.sessionId = response.session.sessionId;
          localStorage.setItem('sessionId', this.sessionId!); // Фикс: !
        }
        if (response.userId) {
          this.userId = response.userId;
          localStorage.setItem('userId', this.userId!); // userId — string
        }
        return response;
      }),
      catchError((error) => {
        if (error.status === 409 && error.error?.message?.includes('Duplicate session')) {
          console.log('Сессия уже существует:', sessionData);
          return of(null);
        }
        if (error.status === 404 && error.error?.message?.includes('User with UUID')) {
          this.userId = null;
          localStorage.removeItem('userId');
          sessionData.userId = null;
          return this.http
            .post(`${this.apiUrl}/users/session`, sessionData, {
              headers: this.getHeaders(),
            })
            .pipe(
              map((response: any) => {
                if (response.session?.sessionId) {
                  this.sessionId = response.session.sessionId;
                  localStorage.setItem('sessionId', this.sessionId!); // Фикс: !
                }
                if (response.userId) {
                  this.userId = response.userId;
                  localStorage.setItem('userId', this.userId!);
                }
                return response;
              }),
              catchError((retryError) => {
                console.error('Повторная ошибка при сохранении сессии:', retryError);
                return of(null);
              })
            );
        }
        console.error('Ошибка при сохранении сессии:', error);
        return of(null);
      })
    )
    .subscribe();
}

// addUser
addUser(user: { 
  name: string; 
  email: string; 
  sessionId: string; 
  userId?: string | null; 
}): Observable<any> {
  const userData = {
    name: user.name,
    email: user.email,
    sessionId: user.sessionId,
    userId: user.userId || null,
  };

  return this.http.post(`${this.apiUrl}/users`, userData, {
    headers: this.getHeaders(),
  }).pipe(
    map((response: any) => {
      if (response.uuid) {
        this.userId = response.uuid;
        localStorage.setItem('userId', this.userId? this.userId : '');
      }
      return response;
    }),
    catchError((error) => {
      console.error('Ошибка при добавлении пользователя:', error);
      return of(null);
    })
  );
}

  // Сохранение результата
  addUserResult(result: UserResult): void {
    result.sessionId = this.sessionId!;
    result.userId = this.userId || null;

    const key = JSON.stringify(result);
    if (this.processedResultKeys.has(key)) {
      console.log('Результат уже отправлен (дубликат), пропускаем.');
      return;
    }
    this.processedResultKeys.add(key);

    this.resultSubject.next(result);
  }

  private sendResultRequest(result: UserResult): void {
    this.http
      .post(`${this.apiUrl}/quizzes/${result.quizId}/submit`, result, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          if (error.status === 409 && error.error?.message?.includes('Duplicate result')) {
            console.log('Результат уже существует:', result);
            return of(null);
          }
          if (error.status === 404 && error.error?.message?.includes('User with UUID')) {
            this.userId = null;
            localStorage.removeItem('userId');
            result.userId = null;
            return this.http
              .post(`${this.apiUrl}/quizzes/${result.quizId}/submit`, result, {
                headers: this.getHeaders(),
              })
              .pipe(
                catchError((retryError) => {
                  console.error('Повторная ошибка при сохранении результата:', retryError);
                  return of(null);
                })
              );
          }
          console.error('Ошибка при сохранении результата:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  // Сбор браузерной информации
  private async collectBrowserInfo(): Promise<UserSessionData['browserInfo']> {
    const ipAddress = await this.getIpAddress();
    let geolocation: { latitude: number; longitude: number } | undefined;

    if (navigator.geolocation) {
      try {
        geolocation = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
            () => resolve(undefined)
          );
        });
      } catch (error) {
        console.warn('Ошибка геолокации:', error);
      }
    }

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: { width: window.screen.width, height: window.screen.height },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookiesEnabled: navigator.cookieEnabled,
      platform: navigator.platform,
      referrer: document.referrer,
      ipAddress,
      geolocation,
    };
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

  // Очистка сессии
  clearSession(): void {
    this.sessionId = null;
    this.userId = null;
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userId');
    this.processedSessionKeys.clear();
    this.processedResultKeys.clear();
  }
}