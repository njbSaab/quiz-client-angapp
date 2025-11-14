// src/app/pages/quiz-result/quiz-result.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UserResult } from '../../../core/interfaces/user.interface';


@Component({
  selector: 'app-quiz-result',
  templateUrl: './quiz-result.component.html',
  styleUrls: ['./quiz-result.component.scss'],
})
export class QuizResultComponent implements OnInit {
  myForm!: FormGroup;
  isCodeVisible = false;
  isSubmitting = false;
  encryptedCode: string | null = null;

  // Временные данные (не в БД!)
  tempName = '';
  tempEmail = '';

  correctAnswersCount = 0;
  totalPoints = 0;
  currentQuestionIndex = 0;
  quizId: number;
  answers: { questionId: number; answerId: number | null }[] = [];

  // Алерты
  showSuccess = false;
  showError = false;
  alertMessage = '';

  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      code: [''],
    });

    this.loadQuizData();
  }

  private loadQuizData() {
    const correct = localStorage.getItem(`quiz_${this.quizId}_correctAnswersCount`);
    const index = localStorage.getItem(`quiz_${this.quizId}_currentQuestionIndex`);
    const points = localStorage.getItem(`quiz_${this.quizId}_totalPoints`);
    const answers = localStorage.getItem(`quiz_${this.quizId}_answers`);

    this.correctAnswersCount = correct ? +correct : 0;
    this.currentQuestionIndex = index ? +index : 0;
    this.totalPoints = points ? +points : 0;
    this.answers = answers ? JSON.parse(answers) : [];
  }

  // ШАГ 1: Сохраняем name + email временно, отправляем код
  sendForm(): void {
    if (this.myForm.get('name')?.valid && this.myForm.get('email')?.valid) {
      this.isSubmitting = true;
      this.showError = false;

      this.tempName = this.myForm.get('name')?.value;
      this.tempEmail = this.myForm.get('email')?.value;

      this.http
        .post(`${this.apiUrl}/email/send-code`, {
          site_url: window.location.origin,
          email_user: this.tempEmail,
        })
        .subscribe({
          next: (response: any) => {
            this.encryptedCode = response.encrypted_code;
            this.isCodeVisible = true;
            this.myForm.get('code')?.setValidators(Validators.required);
            this.myForm.get('code')?.updateValueAndValidity();

            this.showAlert('success', 'Mã đã được gửi đến email của bạn!');
          },
          error: () => {
            this.showAlert('error', 'Mã không đúng.');
          },
        })
        .add(() => {
          this.isSubmitting = false;
        });
    }
  }

  // ШАГ 2: Подтверждаем код → создаём юзера → сохраняем результат
  submitFinalForm(): void {
    if (!this.myForm.valid || !this.encryptedCode || !this.tempName || !this.tempEmail) return;

    this.isSubmitting = true;
    this.showError = false;

    const code = this.myForm.get('code')?.value;

    // 1. Подтверждаем код
    this.http
      .post(`${this.apiUrl}/email/verify`, {
        site_url: window.location.origin,
        email_user: this.tempEmail,
        email_admin: 'web@votevibe.club',
        encrypted_code: this.encryptedCode,
        code: code,
        name_user: this.tempName,
        session_id: this.userService.getSessionId(), // ← ВАЖНО
      })
      .subscribe({
        next: () => {
          // 2. Создаём/связываем пользователя
          this.userService.addUser({
            name: this.tempName,
            email: this.tempEmail,
            sessionId: this.userService.getSessionId(),
            geo: "vn"
          }).subscribe({
            next: () => {
              // 3. ОТПРАВЛЯЕМ РЕЗУЛЬТАТ НА БЭК
              const finalResult = localStorage.getItem(`quiz_${this.quizId}_final_result`);
              if (finalResult) {
                const result = JSON.parse(finalResult);
                const resultWithGeo: UserResult = {
                  ...result,
                  geo: "vn" // ← ВОТ ЭТО ВСЁ, ЧТО НУЖНО
                };
                // this.userService.addUserResult(result); // ← теперь отправляем
                this.userService.addUserResult(resultWithGeo);
              }
              // ОТПРАВЛЯЕМ СОБЫТИЕ В GTM — 100% РАБОТАЕТ В ANGULAR
              (window as any).dataLayer = (window as any).dataLayer || [];
              (window as any).dataLayer.push({
                event: 'form_submit_success',
                quiz_id: this.quizId,
                user_name: this.tempName,
                user_email: this.tempEmail,
                geo: 'vn',
                action: 'quiz_completed',
                timestamp: new Date().toISOString()
              });
              // 4. Очищаем localStorage
              localStorage.removeItem(`quiz_${this.quizId}_final_result`);
              localStorage.removeItem(`quiz_${this.quizId}_id`);

              this.showAlert('success', 'Cảm ơn! Kết quả đã được lưu.');
              setTimeout(() => this.router.navigate(['/quizzes']), 2000);
            },
            error: () => {
              this.showAlert('error', 'Lỗi lưu thông tin người dùng.');
            },
          });
        },
        error: () => {
          this.showAlert('error', 'Mã không đúng.');
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  resendCode(): void {
    if (!this.tempEmail) return;
  
    this.isSubmitting = true;
    this.showError = false;
    this.showSuccess = false;
  
    this.http
      .post(`${this.apiUrl}/email/send-code`, {
        site_url: window.location.origin + '/quvi',
        email_user: this.tempEmail,
      })
      .subscribe({
        next: (response: any) => {
          this.encryptedCode = response.encrypted_code;
          this.showAlert('success', 'Mã đã được gửi lại!');
        },
        error: () => {
          this.showAlert('error', 'Không thể gửi lại mã. Vui lòng thử lại.');
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  private showAlert(type: 'success' | 'error', message: string) {
    this.alertMessage = message;
    if (type === 'success') {
      this.showSuccess = true;
      this.showError = false;
    } else {
      this.showError = true;
      this.showSuccess = false;
    }

    setTimeout(() => {
      this.showSuccess = false;
      this.showError = false;
    }, 3000);
  }
}