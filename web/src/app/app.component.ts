import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SnowEffectComponent } from './shared/components/snow-effect/snow-effect.component';
import { ProductsService } from './core/services/products.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SnowEffectComponent],
  template: `
    <app-snow-effect />
    <app-header />
    <main class="container">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: [`
    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 1rem;
      position: relative;
      z-index: 1;
    }
  `]
})
export class AppComponent {
  constructor(private products: ProductsService) {
    this.products.seedIfEmpty();
  }
}