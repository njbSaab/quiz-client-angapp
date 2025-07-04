import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Quiz } from '../interfaces/quiz.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Утилита для парсинга firstPage
  private parseFirstPage(firstPage: string | undefined): { img?: string; rate?: number } {
    if (!firstPage) {
      return { img: undefined, rate: undefined };
    }
    const [imgPart, ratePart] = firstPage.split('_');
    const img = imgPart.startsWith('img-') ? imgPart.replace('img-', '') : undefined;
    const rate = ratePart?.startsWith('rate-') ? +ratePart.replace('rate-', '') : undefined;
    return { img, rate };
  }

  // Получение всех квизов
  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/quizzes`).pipe(
      map((quizzes) =>
        quizzes.map((quiz) => ({
          ...quiz,
          img: this.parseFirstPage(quiz.firstPage).img,
          rate: this.parseFirstPage(quiz.firstPage).rate,
        }))
      )
    );
  }

  // Получение квиза по ID
  getQuizById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/quizzes/${id}`).pipe(
      map((quiz) => ({
        ...quiz,
        img: this.parseFirstPage(quiz.firstPage).img,
        rate: this.parseFirstPage(quiz.firstPage).rate,
      }))
    );
  }

  // Добавление квиза (если нужно)
  addQuiz(quiz: Quiz): Observable<any> {
    return this.http.post(`${this.apiUrl}/quizzes`, quiz);
  }
}