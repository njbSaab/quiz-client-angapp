import { Component, OnInit } from '@angular/core';
import { ScrollTopService } from '../../core/services/scroll-top.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit {
  quizCount = 0;
  constructor(
      private scrollTop: ScrollTopService,
    ) {}
  
    ngOnInit(): void {
      this.scrollTop.toTop();
    const stored = localStorage.getItem('quizCount');
    this.quizCount = stored ? Number(stored) : 0;
  }
}
