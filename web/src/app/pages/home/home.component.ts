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
  message: { type: 'success' | 'error'; text: string } | null = null;
  private dismissTimeout: ReturnType<typeof setTimeout> | null = null;

  subscribe() {
    const trimmedEmail = this.email.trim();

    if (!trimmedEmail) {
      this.showMessage('error', 'Por favor ingresa tu correo electrónico.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailPattern.test(trimmedEmail)) {
      this.showMessage('error', 'Ingresa un correo válido para continuar.');
      return;
    }

    this.showMessage('success', `¡Gracias por suscribirte! Te enviaremos novedades a ${trimmedEmail}.`);
    this.email = '';
  }

  dismissMessage(): void {
    this.message = null;
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
      this.dismissTimeout = null;
    }
  }

  private showMessage(type: 'success' | 'error', text: string): void {
    this.message = { type, text };
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }
    this.dismissTimeout = setTimeout(() => {
      this.message = null;
      this.dismissTimeout = null;
    }, 5000);
  }
}
