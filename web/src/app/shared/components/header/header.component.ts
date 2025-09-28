import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private cart = inject(CartService);
  private auth = inject(AuthService);

  get count() {
    return this.cart.count();
  }

  get user() {
    return this.auth.current;
  }

  logout() {
    this.auth.logout();
    location.href = '/'; // refresca y vuelve a home
  }
}