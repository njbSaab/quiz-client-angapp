import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit{
  isMenuOpen = false;
  deferredPrompt: any; 
  showInstallButton = false;
  
  ngOnInit(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA можно установить!');
      e.preventDefault();       
      this.deferredPrompt = e;   // Сохраняем событие
      this.showInstallButton = true; // Показываем свою кнопку
    });
  }

  
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
    // Вызывается по клику на твою кнопку «Установить»
    async installPwa() {
      if (!this.deferredPrompt) return;
  
      this.showInstallButton = false;
      this.deferredPrompt.prompt(); // Показываем системный диалог установки
  
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('Пользователь установил PWA');
      } else {
        console.log('Пользователь отказался');
      }
      this.deferredPrompt = null;
    }
}