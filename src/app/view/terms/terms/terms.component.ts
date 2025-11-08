import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ScrollTopService } from '../../../core/services/scroll-top.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent {
@ViewChildren('collapse') collapses!: QueryList<ElementRef>;
  email='privacy@votevibe.club'
  constructor(
        private scrollTop: ScrollTopService,
      ) {}
    
      ngOnInit(): void {
        this.scrollTop.toTop();
  }
  ngAfterViewInit() {
    this.updateBgClasses(); // ← Активирует bg-shadow-cayn для первого
  }

  onCollapseChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // 1. Убираем ВСЕ bg-shadow-* у всех
    this.collapses.forEach((el: ElementRef) => {
      const div = el.nativeElement as HTMLElement;
      div.classList.remove('bg-shadow-cayn', 'bg-shadow-center', 'bg-shadow-fuchsia');
    });

    // 2. Добавляем нужный класс активному
    const activeCollapse = input.closest('.collapse');
    if (activeCollapse) {
      activeCollapse.classList.add(`bg-shadow-${value}`);
    }
  }

  private updateBgClasses() {
    this.collapses.forEach((el: ElementRef) => {
      const div = el.nativeElement as HTMLElement;
      const input = div.querySelector('input') as HTMLInputElement;
      if (input?.checked) {
        div.classList.add(`bg-shadow-${input.value}`);
      }
    });
  }
}
