import { Component, computed, inject, signal } from '@angular/core';
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
    this.itemsSignal().reduce((acc, item) => {
      const unitPrice = item.unitPrice || item.product.price;
      return acc + (unitPrice * item.qty);
    }, 0)
  );
  private readonly countSignal = computed(() =>
    this.itemsSignal().reduce((acc, item) => acc + item.qty, 0)
  );
  private readonly emptySignal = computed(() => this.itemsSignal().length === 0);
  private readonly checkoutPromptSignal = signal(false);
  private readonly shippingCostSignal = signal(10000);

  // Getters para usar en el template
  get items(): CartItem[] {
    return this.itemsSignal();
  }

  get total(): number {
    return this.totalSignal();
  }

  get shippingCost(): number {
    return this.shippingCostSignal();
  }

  get grandTotal(): number {
    return this.total + this.shippingCost;
  }

  get count(): number {
    return this.countSignal();
  }

  get isEmpty(): boolean {
    return this.emptySignal();
  }

  get isCheckoutPromptVisible(): boolean {
    return this.checkoutPromptSignal();
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

  proceedToCheckout(): void {
    this.checkoutPromptSignal.set(true);
  }

  closeCheckoutPrompt(): void {
    this.checkoutPromptSignal.set(false);
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
    const customizationsKey = item.customizations ? JSON.stringify(item.customizations) : '';
    return `${item.product.id}-${item.size}-${customizationsKey}`;
  }

  getItemUnitPrice(item: CartItem): number {
    return item.unitPrice || item.product.price;
  }

  getItemTotalPrice(item: CartItem): number {
    return this.getItemUnitPrice(item) * item.qty;
  }

  getCustomizationDescription(item: CartItem): string {
    if (!item.isCustomized || !item.customizations) {
      return '';
    }

    const descriptions: string[] = [];
    Object.entries(item.customizations).forEach(([categoryId, optionId]) => {
      const category = item.product.customizationOptions?.find(c => c.id === categoryId);
      const option = category?.options.find(o => o.id === optionId);
      if (option) {
        descriptions.push(`${category?.name}: ${option.name}`);
      }
    });

    return descriptions.join(', ');
  }
}
