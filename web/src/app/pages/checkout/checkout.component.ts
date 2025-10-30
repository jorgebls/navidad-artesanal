import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartItem, CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { LocationService, DepartmentDTO, CityDTO } from '../../core/services/location.service';

interface CheckoutForm {
  fullName: string;
  phone: string;
  address: string;
  departmentId: number | null;
  departmentName: string;
  cityId: number | null;
  cityName: string;
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
  private locationService = inject(LocationService);

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
    departmentId: null,
    departmentName: '',
    cityId: null,
    cityName: '',
    notes: ''
  });

  readonly departments = signal<DepartmentDTO[]>([]);
  readonly cities = signal<CityDTO[]>([]);
  readonly loadingCities = signal(false);

  constructor() {
    this.loadDepartments();
  }

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

  async loadDepartments(): Promise<void> {
    try {
      const departments = await this.locationService.listDepartments();
      this.departments.set(departments);
      const currentDept = this.form().departmentId;
      if (!currentDept && departments.length > 0) {
        this.onDepartmentChange(departments[0].id);
      }
    } catch (err) {
      console.error('Error cargando departamentos', err);
    }
  }

  async onDepartmentChange(departmentId: number): Promise<void> {
    const dept = this.departments().find((d) => d.id === departmentId) || null;
    this.form.update((curr) => ({
      ...curr,
      departmentId,
      departmentName: dept?.name ?? '',
      cityId: null,
      cityName: '',
    }));
    await this.loadCities(departmentId);
  }

  async loadCities(departmentId: number): Promise<void> {
    this.loadingCities.set(true);
    try {
      const cities = await this.locationService.listCities(departmentId);
      this.cities.set(cities);
      if (cities.length > 0) {
        this.onCityChange(cities[0].id);
      }
    } catch (err) {
      console.error('Error cargando ciudades', err);
      this.cities.set([]);
      this.form.update((curr) => ({
        ...curr,
        cityId: null,
        cityName: '',
      }));
    } finally {
      this.loadingCities.set(false);
    }
  }

  onCityChange(cityId: number): void {
    const city = this.cities().find((c) => c.id === cityId) || null;
    this.form.update((curr) => ({
      ...curr,
      cityId,
      cityName: city?.name ?? '',
    }));
  }

  isValid(): boolean {
    const v = this.form();
    return (
      v.fullName.trim().length >= 3 &&
      /^\+?\d[\d\s-]{6,}$/.test(v.phone.trim()) &&
      v.address.trim().length >= 5 &&
      !!v.departmentId &&
      !!v.cityId
    );
  }

  async placeOrder(): Promise<void> {
    if (!this.isValid() || this.items.length === 0) return;
    if (this.submitting()) return;

    this.submitting.set(true);
    try {
      const current = this.form();
      if (!current.departmentId || !current.cityId) {
        throw new Error('Faltan datos de ubicación');
      }
      await this.orderService.createFromCart(
        {
          ...current,
          departmentId: current.departmentId,
          cityId: current.cityId,
        },
        this.items,
      );
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
    if (!form.departmentId || !form.cityId) return;
    const items = this.items;
    const total = this.total;
    this.router.navigate(['/checkout/resumen'], {
      state: {
        form: {
          ...form,
          departmentId: form.departmentId,
          cityId: form.cityId,
        },
        items,
        total,
      },
    });
  }

  backToCatalog(): void {
    this.router.navigate(['/catalogo']);
  }

  toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
