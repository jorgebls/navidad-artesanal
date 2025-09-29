import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private cartService = inject(CartService);

  private readonly itemsSignal = this.cartService.items;
  private readonly totalSignal = computed(() =>
    this.itemsSignal().reduce((acc, item) => acc + item.product.price * item.qty, 0)
  );
  private readonly countSignal = computed(() =>
    this.itemsSignal().reduce((acc, item) => acc + item.qty, 0)
  );
  private readonly emptySignal = computed(() => this.itemsSignal().length === 0);

  // Getters para usar en el template
  get items(): CartItem[] {
    return this.itemsSignal();
  }

  get total(): number {
    return this.totalSignal();
  }

  get count(): number {
    return this.countSignal();
  }

  get isEmpty(): boolean {
    return this.emptySignal();
  }

  // Métodos para el template
  updateQuantity(productId: string, size: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const qty = parseInt(target.value) || 0;
    this.cartService.updateQty(productId, size, qty);
  }

  removeItem(productId: string, size: string): void {
    this.cartService.remove(productId, size);
  }

  clearCart(): void {
    this.cartService.clear();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  trackByProductId(index: number, item: CartItem): string {
    return `${item.product.id}-${item.size}`;
  }
}
