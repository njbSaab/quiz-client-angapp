import { Component, OnInit } from '@angular/core';
import { ScrollTopService } from '../../../core/services/scroll-top.service';

@Component({
  selector: 'app-police',
  templateUrl: './police.component.html',
  styleUrl: './police.component.scss'
})
export class PoliceComponent  implements OnInit {
  quizCount = 0;
  mail = 'privacy@votevibe.club'
  constructor(
      private scrollTop: ScrollTopService,
    ) {}
  
    ngOnInit(): void {
      this.scrollTop.toTop();
    const stored = localStorage.getItem('quizCount');
    this.quizCount = stored ? Number(stored) : 0;
  }
}
