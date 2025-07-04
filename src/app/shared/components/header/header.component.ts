import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  onToggleChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const navMenu = document.querySelector('.nav-menu');

    if (navMenu) {
      if (checkbox.checked) {
        navMenu.classList.add('show');
        console.log('Menu opened');
      } else {
        navMenu.classList.remove('show');
        console.log('Menu closed');
      }
    }
  }
}
