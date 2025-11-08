import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appRandomBackground]',
})
export class RandomBackgroundDirective {
  private colors: string[] = [
    '#0886e6',
    '#cc26d5',
    '#67e8f95d',
    '#7d8eef',
    '#7702ff'
  ];

  private usedColors: string[] = []; // Для хранения использованных цветов
  private originalBackground: string = ''; // Для хранения исходного цвета фона

  constructor(private el: ElementRef) {}

  // Сохраняем исходный цвет при наведении
  @HostListener('mouseenter') onMouseEnter() {
    this.originalBackground = this.el.nativeElement.style.background || '';
    this.changeBackground();
  }

  // Возвращаем исходный цвет при покидании элемента
  @HostListener('mouseleave') onMouseLeave() {
    this.resetBackground();
  }

  // Устанавливаем случайный уникальный цвет
  private changeBackground(): void {
    if (this.colors.length === 0) {
      // Если все цвета использованы, восстанавливаем список
      this.colors = [...this.usedColors];
      this.usedColors = [];
    }

    const randomIndex = Math.floor(Math.random() * this.colors.length);
    const randomColor = this.colors[randomIndex];

    // Перемещаем выбранный цвет в список использованных
    this.usedColors.push(randomColor);
    this.colors.splice(randomIndex, 1);

    this.el.nativeElement.style.background = randomColor;
  }

  private resetBackground(): void {
    this.el.nativeElement.style.background = this.originalBackground;
  }
}
