// about.component.ts
import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ScrollTopService } from '../../../core/services/scroll-top.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements AfterViewInit, OnInit {
  quizCount = 0;
  activeTab: string = 'cayn'; // по умолчанию первый активен

  @ViewChildren('collapse') collapses!: QueryList<ElementRef>;

  constructor(private scrollTop: ScrollTopService) {}

  ngOnInit(): void {
    this.scrollTop.toTop();
    const stored = localStorage.getItem('quizCount');
    this.quizCount = stored ? Number(stored) : 0;
  }

  ngAfterViewInit() {
    this.updateBgClasses();
  }

  // Клик по пункту меню
  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.triggerRadioInput(tab);
    this.updateBgClasses();
  }

  // Программно "кликаем" по нужному radio
  private triggerRadioInput(value: string) {
    this.collapses.forEach((el: ElementRef) => {
      const input = el.nativeElement.querySelector('input') as HTMLInputElement;
      if (input && input.value === value) {
        input.checked = true;
      }
    });
  }

  // Обработчик изменения radio (из collapse)
  onCollapseChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.activeTab = input.value; // cayn | fuchsia | center — совпадает!
      this.updateBgClasses();
    }
  }

  // Обновление bg-shadow и бордера
  private updateBgClasses() {
    this.collapses.forEach((el: ElementRef) => {
      const div = el.nativeElement as HTMLElement;
      const input = div.querySelector('input') as HTMLInputElement;

      // Убираем все bg-shadow
      div.classList.remove('bg-shadow-cayn', 'bg-shadow-fuchsia', 'bg-shadow-center');

      // Добавляем нужный
      if (input?.checked) {
        div.classList.add(`bg-shadow-${input.value}`);
      }
    });
  }
}