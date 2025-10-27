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
  private sessionSubject = new Subject<UserSessionData & { requestId: string }>();
  private resultSubject = new Subject<UserResult & { requestId: string }>();
  private processedRequestIds = new Set<string>();

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

  private getHeaders(requestId?: string): HttpHeaders {
    let headers = new HttpHeaders({
      'X-Secret-Word': 'TOPWINNER_TOP_QUIZWIZ_WORLD',
    });
    if (requestId) {
      headers = headers.set('X-Request-Id', requestId);
    }
    return headers;
  }

  getSessionId(): string {
    return this.sessionId!;
  }

  getUserId(): string | null {
    return this.userId;
  }

  saveUserSession(sessionData: UserSessionData): void {
    sessionData.sessionId = this.sessionId!;
    sessionData.userId = this.userId || null;

    const requestId = `${sessionData.sessionId}-${sessionData.quizId}-${Date.now()}`;
    if (this.processedRequestIds.has(requestId)) {
      console.log(`Запрос на сохранение сессии ${requestId} уже обработан, пропускаем.`);
      return;
    }
    this.processedRequestIds.add(requestId);

    console.log('Отправка сессии:', sessionData);
    this.sessionSubject.next({ ...sessionData, requestId });
  }

  private sendSessionRequest(sessionData: UserSessionData & { requestId: string }): void {
    const { requestId, ...data } = sessionData;

    this.http
      .post(`${this.apiUrl}/users/session`, data, {
        headers: this.getHeaders(requestId),
      })
      .pipe(
        map((response: any) => {
          if (response.session?.sessionId) {
            this.sessionId = response.session.sessionId;
            localStorage.setItem('sessionId', this.sessionId || '');
          }
          if (response.userId) {
            this.userId = response.userId;
            localStorage.setItem('userId', this.userId || '');
          }
          return response;
        }),
        catchError((error) => {
          if (error.status === 409 && error.error?.message?.includes('Duplicate session')) {
            console.log('Сессия уже существует:', data);
            return of(null);
          }
          if (error.status === 404 && error.error?.message?.includes('User with UUID')) {
            this.userId = null;
            localStorage.removeItem('userId');
            data.userId = null;
            return this.http
              .post(`${this.apiUrl}/users/session`, data, {
                headers: this.getHeaders(requestId),
              })
              .pipe(
                map((response: any) => {
                  if (response.session?.sessionId) {
                    this.sessionId = response.session.sessionId;
                    localStorage.setItem('sessionId', this.sessionId || '');
                  }
                  if (response.userId) {
                    this.userId = response.userId;
                    localStorage.setItem('userId', this.userId || '');
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

  addUserResult(result: UserResult): void {
    result.sessionId = this.sessionId!;
    result.userId = this.userId || null;

    const requestId = `${result.sessionId}-${result.quizId}-${Date.now()}`;
    if (this.processedRequestIds.has(requestId)) {
      console.log(`Запрос на сохранение результата ${requestId} уже обработан, пропускаем.`);
      return;
    }
    this.processedRequestIds.add(requestId);

    console.log('Отправка результата:', result);
    this.resultSubject.next({ ...result, requestId });
  }

  private sendResultRequest(result: UserResult & { requestId: string }): void {
    const { requestId, ...data } = result;

    this.http
      .post(`${this.apiUrl}/quizzes/${data.quizId}/submit`, data, {
        headers: this.getHeaders(requestId),
      })
      .pipe(
        catchError((error) => {
          if (error.status === 409 && error.error?.message?.includes('Duplicate result')) {
            console.log('Результат уже существует:', data);
            return of(null);
          }
          if (error.status === 404 && error.error?.message?.includes('User with UUID')) {
            this.userId = null;
            localStorage.removeItem('userId');
            data.userId = null;
            return this.http
              .post(`${this.apiUrl}/quizzes/${data.quizId}/submit`, data, {
                headers: this.getHeaders(requestId),
              })
              .pipe(
                catchError((retryError) => {
                  console.error('Повторная ошибка при сохранении результатов:', retryError);
                  return of(null);
                })
              );
          }
          console.error('Ошибка при сохранении результатов:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  addUser(user: { name: string; email: string }): Observable<any> {
    const userData = {
      name: user.name,
      email: user.email,
      sessionId: this.sessionId!,
      userId: this.userId || null,
    };

    const requestId = `${this.sessionId}-${Date.now()}`;
    if (this.processedRequestIds.has(requestId)) {
      console.log(`Запрос на добавление пользователя ${requestId} уже обработан, пропускаем.`);
      return of(null);
    }
    this.processedRequestIds.add(requestId);

    return this.http
      .post(`${this.apiUrl}/users`, userData, {
        headers: this.getHeaders(requestId),
      })
      .pipe(
        map((response: any) => {
          if (response.uuid) {
            this.userId = response.uuid;
            localStorage.setItem('userId', this.userId || '');
          }
          return response;
        }),
        catchError((error) => {
          console.error('Ошибка при добавлении пользователя:', error);
          return of(null);
        })
      );
  }

  private async collectBrowserInfo(): Promise<UserSessionData['browserInfo']> {
    const ipAddress = await this.getIpAddress();
    let geolocation: { latitude: number; longitude: number } | undefined;

    if (navigator.geolocation) {
      try {
        geolocation = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
            (error) => {
              console.warn('Геолокация не получена:', error);
              resolve(undefined);
            }
          );
        });
      } catch (error) {
        console.warn('Ошибка получения геолокации:', error);
      }
    }

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
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

  clearSession(): void {
    this.sessionId = null;
    this.userId = null;
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userId');
    this.processedRequestIds.clear();
  }
}