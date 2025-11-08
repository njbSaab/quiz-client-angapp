import { Component, OnInit } from '@angular/core';
import { ScrollTopService } from '../../../core/services/scroll-top.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {
  quizCount = 0;
  mail = 'hello@votevibe.club'

  constructor(    private scrollTop: ScrollTopService,
    ) {}
  
    ngOnInit(): void {
      this.scrollTop.toTop();
    const stored = localStorage.getItem('quizCount');
    this.quizCount = stored ? Number(stored) : 0;
  }


}
