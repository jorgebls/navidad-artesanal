import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CartItem } from './cart.service';

export interface OrderStatusDTO {
  code: 'IN_PROCESS' | 'COMPLETED' | 'CANCELLED';
  label: string;
}

export interface OrderLocationDTO {
  id: number;
  name: string;
  department: {
    id: number;
    name: string;
  } | null;
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  size: string;
  qty: number;
  unitPrice: string;
  customizations?: Record<string, string> | null;
}

export interface OrderDTO {
  id: string;
  customerName: string;
  phone: string;
  city: OrderLocationDTO;
  address: string;
  notes?: string | null;
  total: string;
  status: OrderStatusDTO;
  paymentMethod: 'COD';
  createdAt: string;
  items: OrderItemDTO[];
}

interface CreateOrderPayload {
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  paymentMethod: 'COD';
  total: number;
  departmentId: number;
  cityId: number;
  items: Array<{
    productId: string;
    productName: string;
    size: string;
    qty: number;
    unitPrice: number;
    customizations?: { [categoryId: string]: string };
  }>;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/order';

  async createFromCart(
    form: {
      fullName: string;
      phone: string;
      address: string;
      notes?: string;
      departmentId: number;
      cityId: number;
    },
    items: CartItem[],
  ): Promise<OrderDTO> {
    const payload: CreateOrderPayload = {
      customerName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      notes: form.notes?.trim() || undefined,
      paymentMethod: 'COD',
      total: items.reduce((acc, i) => acc + (i.unitPrice || i.product.price) * i.qty, 0) + 15000,
      departmentId: form.departmentId,
      cityId: form.cityId,
      items: items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        size: i.size,
        qty: i.qty,
        unitPrice: i.unitPrice || i.product.price,
        customizations: i.isCustomized ? i.customizations : undefined,
      })),
    };

    return await firstValueFrom(this.http.post<OrderDTO>(this.baseUrl, payload));
  }

  async listMine(): Promise<OrderDTO[]> {
    return await firstValueFrom(this.http.get<OrderDTO[]>(`${this.baseUrl}/me`));
  }

  async cancel(orderId: string): Promise<OrderDTO> {
    return await firstValueFrom(this.http.patch<OrderDTO>(`${this.baseUrl}/${orderId}/cancel`, {}));
  }
}
