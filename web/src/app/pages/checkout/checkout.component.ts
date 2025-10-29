import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartItem, CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';

interface CheckoutForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  private cartService = inject(CartService);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  private readonly itemsSignal = this.cartService.items;
  private readonly totalSignal = computed(() =>
    this.itemsSignal().reduce((acc, item) => {
      const unitPrice = item.unitPrice || item.product.price;
      return acc + (unitPrice * item.qty);
    }, 0)
  );
  private readonly shippingSignal = signal(15000);
  private readonly grandTotalSignal = computed(() => this.totalSignal() + this.shippingSignal());

  submitting = signal(false);
  submitted = signal(false);

  form = signal<CheckoutForm>({
    fullName: this.getDefaultFullName(),
    phone: this.getDefaultPhone(),
    address: '',
    city: '',
    notes: ''
  });

  private getDefaultFullName(): string {
    const user = this.authService.current;
    const first = user?.firstName?.trim() || '';
    const last = user?.lastName?.trim() || '';
    return [first, last].filter(Boolean).join(' ');
  }

  private getDefaultPhone(): string {
    const user = this.authService.current;
    return (user?.phone || '').toString();
  }

  get items(): CartItem[] { return this.itemsSignal(); }
  get total(): number { return this.totalSignal(); }
  get shipping(): number { return this.shippingSignal(); }
  get grandTotal(): number { return this.grandTotalSignal(); }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  updateField<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]): void {
    this.form.update(curr => ({ ...curr, [key]: value }));
  }

  isValid(): boolean {
    const v = this.form();
    return (
      v.fullName.trim().length >= 3 &&
      /^\+?\d[\d\s-]{6,}$/.test(v.phone.trim()) &&
      v.address.trim().length >= 5 &&
      v.city.trim().length >= 2
    );
  }

  async placeOrder(): Promise<void> {
    if (!this.isValid() || this.items.length === 0) return;
    if (this.submitting()) return;

    this.submitting.set(true);
    try {
      await this.orderService.createFromCart(this.form(), this.items);
      this.cartService.clear();
      this.submitted.set(true);
    } catch (err) {
      console.error('Error creando el pedido', err);
      alert('No pudimos crear tu pedido. Intenta nuevamente.');
    } finally {
      this.submitting.set(false);
    }
  }

  goToSummary(): void {
    if (!this.isValid() || this.items.length === 0) return;
    const form = this.form();
    const items = this.items;
    const total = this.total;
    this.router.navigate(['/checkout/resumen'], { state: { form, items, total } });
  }

  backToCatalog(): void {
    this.router.navigate(['/catalogo']);
  }
}


