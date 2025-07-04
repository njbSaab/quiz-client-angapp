import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'quiz-app-ang';

  toggleTheme(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked; // Проверяем состояние чекбокса
    const theme = isChecked ? 'acid' : 'dracula'; // Выбираем тему
    document.documentElement.setAttribute('data-theme', theme); // Устанавливаем тему
  }
}
