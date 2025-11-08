import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollTopService {
/** Прокрутка к верху с плавной анимацией (500мс) */
toTop(): void {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
}

/** Мгновенная прокрутка (если нужна жёсткая) */
toTopInstant(): void {
  window.scrollTo(0, 0);
}
}
