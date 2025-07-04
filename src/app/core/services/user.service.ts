import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Добавление пользователя
  addUser(user: { name: string; email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user);
  }

  // Сохранение результата квиза
  addUserResult(result: { userId: number; quizId: number; score: number; answers: any }): Observable<any> {
    return this.http.post(`${this.apiUrl}/user-results`, result);
  }
}