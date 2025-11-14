import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from './core/services/layout.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy, OnInit{
  title = 'quiz-app-ang';
  showHeaderFooter = true;
  private subscription: Subscription;

  constructor(private layoutService: LayoutService) {
    this.subscription = this.layoutService.showHeaderFooter$.subscribe(
      visible => this.showHeaderFooter = visible
    );
  }
  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleTheme(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked; // Проверяем состояние чекбокса
    const theme = isChecked ? 'acid' : 'dracula'; // Выбираем тему
    document.documentElement.setAttribute('data-theme', theme); // Устанавливаем тему
  }

}
