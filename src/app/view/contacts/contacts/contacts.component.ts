import { Component, OnInit } from '@angular/core';
import { quizzes } from '../../../../assets/quiz-data'; // Путь к вашему массиву данных

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  // Метод для загрузки всех квизов
  async uploadQuizzes() {
    for (const quiz of quizzes) {
    }
    console.log('All quizzes uploaded successfully');
  }
}
