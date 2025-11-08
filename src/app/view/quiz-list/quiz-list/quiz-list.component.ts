import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz } from '../../../core/interfaces/quiz.interface';
import { ScrollTopService } from '../../../core/services/scroll-top.service';

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
  isvisible: boolean = true;
  filteredQuizzes: Quiz[] = [];
  showAll = false; // флаг: показывать все или только main

  constructor(
    private quizService: QuizService,
    private cdr: ChangeDetectorRef,
    private scrollTop: ScrollTopService,
  ) {}

  ngOnInit(): void {
    this.scrollTop.toTop();
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getQuizzes().subscribe({
      next: (data: Quiz[]) => {
        // Фильтруем только активные
        this.quizzes = data.filter(q => q.isActive);
        this.updateFilteredQuizzes();
      },
      error: (err) => console.error('Ошибка загрузки квизов:', err),
    });
  }

  // Обновляем отображаемые квизы
  private updateFilteredQuizzes() {
    if (this.showAll) {
      this.filteredQuizzes = this.quizzes; // все активные
    } else {
      this.filteredQuizzes = this.quizzes.filter(q => q.isMainView); // только main
    }
    this.cdr.markForCheck();
  }

  // Вызывается из баннера
  showAllQuizzes() {
    this.showAll = true;
    this.updateFilteredQuizzes();
    this.hideBanner(); // скрываем баннер
  }

  hideBanner() {
    this.isvisible = false;
  }
}