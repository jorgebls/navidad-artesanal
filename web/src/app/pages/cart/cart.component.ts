import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private cartService = inject(CartService);

  // Getters para usar en el template
  get items(): CartItem[] {
    return this.cartService.all();
  }

  get total(): number {
    return this.cartService.total();
  }

  get count(): number {
    return this.cartService.count();
  }

  get isEmpty(): boolean {
    return this.cartService.isEmpty();
  }

  // Métodos para el template
  updateQuantity(productId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const qty = parseInt(target.value) || 0;
    this.cartService.updateQty(productId, qty);
  }

  removeItem(productId: string): void {
    this.cartService.remove(productId);
  }

  clearCart(): void {
    this.cartService.clear();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  trackByProductId(index: number, item: CartItem): string {
    return item.product.id;
  }
}
