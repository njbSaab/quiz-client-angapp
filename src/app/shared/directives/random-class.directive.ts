import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appRandomBackground]',
})
export class RandomBackgroundDirective {
  private colors: string[] = [
    'oklch(51.01% 0.274 263.83)', // bright-blue
    'oklch(53.18% 0.28 296.97)', // electric-violet
    'oklch(47.66% 0.246 305.88)', // french-violet
    'oklch(69.02% 0.277 332.77)', // vivid-pink
    'oklch(58.42% 0.238 15.34)', // hot-red
    'oklch(63.32% 0.24 31.68)',  // orange-red
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
