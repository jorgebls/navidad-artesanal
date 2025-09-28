import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  email = '';

  subscribe() {
    if (this.email) {
      alert(`¡Gracias por suscribirte con ${this.email}!`);
      this.email = '';
    } else {
      alert('Por favor, ingresa tu email');
    }
  }
}
