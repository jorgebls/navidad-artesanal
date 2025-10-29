import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartItem, CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/models/user.model';

interface CheckoutForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

@Component({
  selector: 'app-checkout-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout-summary.component.html',
  styleUrl: './checkout-summary.component.scss'
})
export class CheckoutSummaryComponent {
  private router = inject(Router);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  submitting = signal(false);
  submitted = signal(false);

  form: CheckoutForm | null = null;
  items: CartItem[] = [];
  total = 0;
  shipping = 15000;
  get grandTotal(): number { return this.total + this.shipping; }
  currentUser: User | null = null;
  orderDate: Date = new Date();

  constructor() {
    const nav = history.state as { form?: CheckoutForm; items?: CartItem[]; total?: number };
    if (!nav || !nav.form) {
      this.router.navigate(['/checkout']);
      return;
    }
    this.form = nav.form;
    this.currentUser = this.authService.current;
    // Always trust live cart for items/total in case user changed something
    this.items = this.cartService.items();
    this.total = this.items.reduce((acc, it) => acc + ((it.unitPrice || it.product.price) * it.qty), 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  formatDateTime(date: Date): string {
    const datePart = new Intl.DateTimeFormat('es-CO', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
    const timePart = new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(date);
    return `${datePart} ${timePart}`;
  }

  async confirmOrder(): Promise<void> {
    if (!this.form || this.items.length === 0) return;
    if (this.submitting()) return;
    this.submitting.set(true);
    try {
      await this.orderService.createFromCart(this.form, this.items);
      this.cartService.clear();
      this.submitted.set(true);
    } catch (err) {
      console.error('Error creando el pedido', err);
      alert('No pudimos crear tu pedido. Intenta nuevamente.');
    } finally {
      this.submitting.set(false);
    }
  }

  editData(): void {
    this.router.navigate(['/checkout']);
  }

  backToCatalog(): void {
    this.router.navigate(['/catalogo']);
  }
}


