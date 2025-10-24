import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserResult } from '../../../core/interfaces/user.interface';

@Component({
  selector: 'app-quiz-result',
  templateUrl: './quiz-result.component.html',
  styleUrls: ['./quiz-result.component.scss'],
})
export class QuizResultComponent implements OnInit {
  myForm!: FormGroup;
  isCodeVisible: boolean = false;
  correctAnswersCount: number = 0;
  totalPoints: number = 0;
  currentQuestionIndex: number = 0;
  quizId: number;
  answers: { questionId: number; answerId: number | null }[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      code: [''],
    });

    // Загружаем данные из localStorage для текущего quizId
    const correctAnswersCount = localStorage.getItem(`quiz_${this.quizId}_correctAnswersCount`);
    const currentQuestionIndex = localStorage.getItem(`quiz_${this.quizId}_currentQuestionIndex`);
    const totalPoints = localStorage.getItem(`quiz_${this.quizId}_totalPoints`);
    const answers = localStorage.getItem(`quiz_${this.quizId}_answers`);

    this.correctAnswersCount = correctAnswersCount ? +correctAnswersCount : 0;
    this.currentQuestionIndex = currentQuestionIndex ? +currentQuestionIndex : 0;
    this.totalPoints = totalPoints ? +totalPoints : 0;
    this.answers = answers ? JSON.parse(answers) : [];

    this.saveQuizResult();
  }

  submitFinalForm(): void {
    if (this.myForm.valid) {
      console.log('Верификация кода:', this.myForm.get('code')?.value);
      this.router.navigate(['/quizzes']);
    }
  }

  private saveQuizResult(): void {
    const resultData: UserResult = {
      quizId: this.quizId,
      sessionId: this.userService.getSessionId(),
      userId: this.userService.getUserId() || null,
      score: this.totalPoints,
      answers: this.answers.filter((answer) => answer.answerId !== null) as {
        questionId: number;
        answerId: number;
      }[],
    };

    this.userService.addUserResult(resultData).subscribe({
      next: (response) => {
        console.log('Результаты сохранены:', response);
        // Очищаем данные после сохранения результатов
        localStorage.removeItem(`quiz_${this.quizId}_id`);
        localStorage.removeItem(`quiz_${this.quizId}_currentQuestionIndex`);
        localStorage.removeItem(`quiz_${this.quizId}_correctAnswersCount`);
        localStorage.removeItem(`quiz_${this.quizId}_totalPoints`);
        localStorage.removeItem(`quiz_${this.quizId}_answers`);
        localStorage.removeItem(`quiz_${this.quizId}_completed`);
      },
      error: (error) => {
        console.error('Ошибка сохранения результатов:', error);
      },
    });
  }

  sendForm(): void {
    if (this.myForm.get('name')?.valid && this.myForm.get('email')?.valid) {
      console.log('Форма отправлена:', this.myForm.value);
      this.userService.addUser({
        name: this.myForm.get('name')?.value,
        email: this.myForm.get('email')?.value,
      }).subscribe({
        next: (response) => {
          console.log('Пользователь добавлен:', response);
          this.isCodeVisible = true;
          this.myForm.get('code')?.setValidators(Validators.required);
          this.myForm.get('code')?.updateValueAndValidity();
        },
        error: (error) => {
          console.error('Ошибка добавления пользователя:', error);
        },
      });
    }
  }
}