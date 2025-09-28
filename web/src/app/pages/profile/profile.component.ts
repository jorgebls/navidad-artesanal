import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  private auth = inject(AuthService);

  get user() {
    return this.auth.current;
  }

  logout() {
    this.auth.logout();
    location.href = '/'; // 👈 redirige al home
  }
}