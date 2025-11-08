// banner.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent {
  @Input() quizCount: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() showAll = new EventEmitter<void>(); 

  onCloseClick() {
    this.close.emit();      // скрываем баннер
    this.showAll.emit();    // показываем все квизы
  }
}