import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute
  ) {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      code: [''],
    });

    const correctAnswersCount = localStorage.getItem('correctAnswersCount');
    const currentQuestionIndex = localStorage.getItem('currentQuestionIndex');
    const totalPoints = localStorage.getItem('totalPoints');

    this.correctAnswersCount = correctAnswersCount ? +correctAnswersCount : 0;
    this.currentQuestionIndex = currentQuestionIndex ? +currentQuestionIndex : 0;
    this.totalPoints = totalPoints ? +totalPoints : 0;
  }

  sendForm(): void {
    if (this.myForm.get('name')?.valid && this.myForm.get('email')?.valid) {
      console.log('Форма отправлена:', this.myForm.value);
      this.isCodeVisible = true;
      this.myForm.get('code')?.setValidators(Validators.required);
      this.myForm.get('code')?.updateValueAndValidity();
    }
  }

  submitFinalForm(): void {
    if (this.myForm.valid) {
      const userData = {
        name: this.myForm.get('name')?.value,
        email: this.myForm.get('email')?.value,
      };

      // Сохраняем пользователя
      this.userService.addUser(userData).subscribe({
        next: (user) => {
          console.log('Пользователь сохранен:', user);
          const resultData = {
            userId: user.id || 1, // Предполагаем, что сервер возвращает ID пользователя
            quizId: this.quizId,
            score: this.totalPoints,
            answers: [] // Заполните, если нужно отправить ответы
          };

          // Сохраняем результаты
          this.userService.addUserResult(resultData).subscribe({
            next: () => console.log('Результаты сохранены'),
            error: (error) => console.error('Ошибка сохранения результатов:', error)
          });
        },
        error: (error) => console.error('Ошибка сохранения пользователя:', error)
      });
    }
  }
}