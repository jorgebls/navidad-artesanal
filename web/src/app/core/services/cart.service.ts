import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { LS } from './keys';
import { Product } from '../../shared/models/product.model';

export interface CartItem {
  product: Product;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private storage = inject(StorageService);

  private get items(): CartItem[] {
    return this.storage.get<CartItem[]>(LS.CART, []);
  }

  private set items(val: CartItem[]) {
    this.storage.set(LS.CART, val);
  }

  all(): CartItem[] {
    return this.items;
  }

  count(): number {
    return this.items.reduce((acc, item) => acc + item.qty, 0);
  }

  add(product: Product, qty = 1) {
    const items = this.items;
    const existing = items.find(i => i.product.id === product.id);
    if (existing) existing.qty += qty;
    else items.push({ product, qty });
    this.items = items;
  }

  clear() {
    this.items = [];
  }
}