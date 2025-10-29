import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  email = '';
  message: { type: 'success' | 'error'; text: string } | null = null;
  private dismissTimeout: ReturnType<typeof setTimeout> | null = null;
  private svc = inject(ProductsService);
  featuredProducts: Product[] = [];
  private readonly defaultSize = 'M';

  async ngOnInit() {
    await this.loadFeaturedProducts();
  }

  private async loadFeaturedProducts() {
    try {
      const response = await this.svc.list({ limit: 50, sortBy: 'createdAt', sortOrder: 'DESC' });
      const products = response.data;
      // Tomar siempre los primeros 3 productos
      this.featuredProducts = products.slice(0, Math.min(3, products.length));
    } catch (err) {
      // Si falla, dejar vacío y no romper el home
      this.featuredProducts = [];
      console.error('No se pudieron cargar productos destacados', err);
    }
  }

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/img/images.jpeg';
  }

  priceForDefaultSize(product: Product): number {
    const variant = product.sizes?.find(v => v.size.toUpperCase() === this.defaultSize);
    return variant?.price ?? product.price;
  }

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
