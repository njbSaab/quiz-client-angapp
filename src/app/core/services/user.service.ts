import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  constructor(private http: HttpClient) {
    this.sessionId = localStorage.getItem('sessionId') || null;
    this.userId = localStorage.getItem('userId') || null;
    if (!this.sessionId) {
      this.sessionId = uuidv4();
      localStorage.setItem('sessionId', this.sessionId);
    }
    if (this.userId) {
      // Проверяем валидность userId
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

  saveUserSession(sessionData: UserSessionData): Observable<any> {
    sessionData.sessionId = this.sessionId!;
    sessionData.userId = this.userId || null;

    return this.http
      .post(`${this.apiUrl}/users/session`, sessionData, {
        headers: this.getHeaders(),
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
          if (error.status === 404 && error.error?.message?.includes('User with UUID')) {
            // Если пользователь не найден, очищаем userId
            this.userId = null;
            localStorage.removeItem('userId');
            // Повторяем запрос без userId
            sessionData.userId = null;
            return this.http
              .post(`${this.apiUrl}/users/session`, sessionData, {
                headers: this.getHeaders(),
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
      );
  }

  addUserResult(result: UserResult): Observable<any> {
    result.sessionId = this.sessionId!;
    result.userId = this.userId || null;

    return this.http
      .post(`${this.apiUrl}/quizzes/${result.quizId}/submit`, result, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          if (error.status === 404 && error.error?.message?.includes('User with UUID')) {
            // Если пользователь не найден, очищаем userId
            this.userId = null;
            localStorage.removeItem('userId');
            // Повторяем запрос без userId
            result.userId = null;
            return this.http
              .post(`${this.apiUrl}/quizzes/${result.quizId}/submit`, result, {
                headers: this.getHeaders(),
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
      );
  }

  addUser(user: { name: string; email: string }): Observable<any> {
    const userData = {
      name: user.name,
      email: user.email,
      sessionId: this.sessionId!,
      userId: this.userId || null,
    };

    return this.http
      .post(`${this.apiUrl}/users`, userData, {
        headers: this.getHeaders(),
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
  }
}