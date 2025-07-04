import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appChangeBackground]',
})
export class ChangeBackgroundDirective {
  private colors: string[] = [
    'bg-gradinet-red-90',
    'bg-gradient-regular-90',
    'bg-gradinet-accent-0',
    'bg-gradient-regular-0',
    'bg-gradinet-red-0',
  ];
  private currentIndex = -1;

  constructor(private el: ElementRef) {
    // Устанавливаем изначальный цвет
    this.el.nativeElement.style.background = '#282a36';
  }

  // Слушатель кликов
  @HostListener('click') onClick(): void {
    // Убираем текущий класс
    if (this.currentIndex >= 0) {
      this.el.nativeElement.classList.remove(this.colors[this.currentIndex]);
    }

    // Переход к следующему цвету
    this.currentIndex = (this.currentIndex + 1) % this.colors.length;

    // Добавляем новый класс
    this.el.nativeElement.classList.add(this.colors[this.currentIndex]);
  }
}
