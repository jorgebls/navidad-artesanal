import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CartItem } from './cart.service';

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  paymentMethod: 'COD';
  total: number;
  items: Array<{
    productId: string;
    productName: string;
    size: string;
    qty: number;
    unitPrice: number;
    customizations?: { [categoryId: string]: string };
  }>;
}

export interface CreateOrderResponse {
  id: string;
  createdAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/order';

  async createFromCart(
    form: { fullName: string; phone: string; city: string; address: string; notes?: string },
    items: CartItem[],
  ): Promise<CreateOrderResponse> {
    const payload: CreateOrderPayload = {
      customerName: form.fullName.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      notes: form.notes?.trim() || undefined,
      paymentMethod: 'COD',
      total: items.reduce((acc, i) => acc + (i.unitPrice || i.product.price) * i.qty, 0) + 15000,
      items: items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        size: i.size,
        qty: i.qty,
        unitPrice: i.unitPrice || i.product.price,
        customizations: i.isCustomized ? i.customizations : undefined,
      })),
    };

    return await firstValueFrom(this.http.post<CreateOrderResponse>(this.baseUrl, payload));
  }
}


