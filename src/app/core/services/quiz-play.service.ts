import { Observable, of } from 'rxjs';
import { Quiz } from '../interfaces/quiz.interface';
import { quizzes } from '../../../assets/quiz-data';

export class QuizPlayService {
  getQuizById(quizId: number): Observable<Quiz | undefined> {
    const quiz = quizzes.find((q) => q.id === quizId);
    return of(quiz);
  }
}