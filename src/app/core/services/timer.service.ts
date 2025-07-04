import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private timerSubscription: Subscription | null = null;
  private totalTime = 30; // Время в секундах

  // Текущее время и прогресс
  currentTime$ = new BehaviorSubject<number>(this.totalTime);
  progress$ = new BehaviorSubject<number>(0);

  // Запуск таймера
  startTimer(): void {
    this.resetTimer();

    const progressInterval = 100; // Интервал обновления в миллисекундах
    const totalSteps = this.totalTime * (1000 / progressInterval);

    let elapsedSteps = 0;

    this.timerSubscription = interval(progressInterval).subscribe(() => {
      elapsedSteps++;
      const remainingTime = this.totalTime - Math.floor((elapsedSteps * progressInterval) / 1000);
      const progress = (elapsedSteps / totalSteps) * 100;

      if (remainingTime >= 0) {
        this.currentTime$.next(remainingTime);
        this.progress$.next(progress);
      } else {
        this.stopTimer(); // Остановить таймер, если он завершился
      }
    });
  }

  // Сброс таймера
  resetTimer(): void {
    this.stopTimer();
    this.currentTime$.next(this.totalTime);
    this.progress$.next(0);
  }

  // Остановка таймера
  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }

    this.currentTime$.next(this.totalTime);
    this.progress$.next(0);
  }
}
