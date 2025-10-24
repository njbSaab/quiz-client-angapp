import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Quiz } from '../../../core/interfaces/quiz.interface';

@Component({
  selector: 'app-quiz-finished',
  templateUrl: './quiz-finished.component.html',
  styleUrls: ['./quiz-finished.component.scss'],
})
export class QuizFinishedComponent {
  @Input() quiz: Quiz | undefined;
  @Output() reset = new EventEmitter<void>();
  @Output() getResults = new EventEmitter<void>();
}