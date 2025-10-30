import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrderDTO, OrderService } from '../../core/services/order.service';

type ProfileFormValue = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentId: string;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly ordersService = inject(OrderService);
  private readonly router = inject(Router);

  readonly user = this.auth.userSignal;

  readonly orders = signal<OrderDTO[]>([]);
  readonly ordersLoading = signal(false);
  readonly ordersError = signal<string | null>(null);
  readonly cancellingOrderId = signal<string | null>(null);

  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly formSuccess = signal<string | null>(null);

  readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    documentId: ['', [Validators.required, Validators.minLength(5)]],
  });

  constructor() {
    effect(() => {
      const current = this.user();
      if (current) {
        this.form.patchValue(
          {
            firstName: current.firstName,
            lastName: current.lastName,
            email: current.email,
            phone: current.phone,
            documentId: current.documentId,
          },
          { emitEvent: false },
        );
        this.form.markAsPristine();
      } else {
        this.form.reset();
      }
    });
  }

  ngOnInit(): void {
    this.auth.ensureSession().then((ok) => {
      if (ok) {
        this.loadOrders();
      }
    });
  }

  async loadOrders() {
    this.ordersLoading.set(true);
    this.ordersError.set(null);
    try {
      const orders = await this.ordersService.listMine();
      this.orders.set(orders);
    } catch (err) {
      this.ordersError.set(this.extractErrorMessage(err));
    } finally {
      this.ordersLoading.set(false);
    }
  }

  async cancelOrder(order: OrderDTO) {
    if (order.status.code !== 'IN_PROCESS' || this.cancellingOrderId()) return;
    this.cancellingOrderId.set(order.id);
    try {
      const updated = await this.ordersService.cancel(order.id);
      this.orders.update((current) => current.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      this.ordersError.set(this.extractErrorMessage(err));
    } finally {
      this.cancellingOrderId.set(null);
    }
  }

  async submit() {
    this.formError.set(null);
    this.formSuccess.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value as ProfileFormValue;
    const payload = {
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      email: value.email.trim(),
      phone: value.phone.trim(),
      documentId: value.documentId.trim(),
    };

    this.saving.set(true);
    const res = await this.auth.updateProfile(payload);
    this.saving.set(false);

    if (!res.ok) {
      this.formError.set(res.msg ?? 'No se pudo actualizar tu perfil');
      return;
    }

    this.form.markAsPristine();
    this.formSuccess.set('Perfil actualizado correctamente.');
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  formatPrice(value: string | number) {
    const amount = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(amount)) return '$0';
    return amount.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  trackByOrderId(index: number, order: OrderDTO) {
    return order.id;
  }

  private extractErrorMessage(err: any): string {
    const message = err?.error?.message ?? err?.message ?? 'Error inesperado';
    if (Array.isArray(message)) {
      return message[0];
    }
    return message;
  }
}
