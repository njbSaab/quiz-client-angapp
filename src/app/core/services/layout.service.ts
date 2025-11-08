import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Приватное поле с подчёркиванием — стандартная практика
  private _showHeaderFooter = new BehaviorSubject<boolean>(true);

  // Публичный стрим для подписки
  showHeaderFooter$: Observable<boolean> = this._showHeaderFooter.asObservable();

  // Метод скрытия
  hideHeaderFooter(): void {
    this._showHeaderFooter.next(false);
  }

  // Метод показа
  showHeaderFooter(): void {
    this._showHeaderFooter.next(true);
  }

  // Опционально: получить текущее значение синхронно
  getHeaderFooterVisible(): boolean {
    return this._showHeaderFooter.value;
  }
}