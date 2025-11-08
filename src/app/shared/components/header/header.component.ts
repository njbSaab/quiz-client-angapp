import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isMenuOpen = false;

  /** Синхронизация с нативным чекбоксом */
  onToggle(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isMenuOpen = checkbox.checked;
  }

  /** Закрытие меню + сброс чекбокса */
  closeMenu(): void {
    this.isMenuOpen = false;

    // Сбрасываем чекбокс, чтобы анимация swap-rotate работала корректно
    const checkbox = document.getElementById('menu-toggle') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false;
    }
  }
}