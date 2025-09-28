import { Injectable, inject, signal } from '@angular/core';
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

  // Signals para reactividad
  private _items = signal<CartItem[]>(this.loadFromStorage());
  public items = this._items.asReadonly();

  private get itemsValue(): CartItem[] {
    return this._items();
  }

  private set itemsValue(val: CartItem[]) {
    this._items.set(val);
    this.saveToStorage(val);
  }

  private loadFromStorage(): CartItem[] {
    return this.storage.get<CartItem[]>(LS.CART, []);
  }

  private saveToStorage(items: CartItem[]): void {
    this.storage.set(LS.CART, items);
  }

  // Métodos públicos
  all(): CartItem[] {
    return this.itemsValue;
  }

  count(): number {
    return this.itemsValue.reduce((acc, item) => acc + item.qty, 0);
  }

  total(): number {
    return this.itemsValue.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
  }

  add(product: Product, qty = 1): void {
    const items = [...this.itemsValue];
    const existing = items.find(i => i.product.id === product.id);
    
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ product, qty });
    }
    
    this.itemsValue = items;
  }

  remove(productId: string): void {
    const items = this.itemsValue.filter(item => item.product.id !== productId);
    this.itemsValue = items;
  }

  updateQty(productId: string, qty: number): void {
    if (qty <= 0) {
      this.remove(productId);
      return;
    }

    const items = [...this.itemsValue];
    const existing = items.find(i => i.product.id === productId);
    
    if (existing) {
      existing.qty = qty;
      this.itemsValue = items;
    }
  }

  getItem(productId: string): CartItem | undefined {
    return this.itemsValue.find(item => item.product.id === productId);
  }

  hasItem(productId: string): boolean {
    return this.itemsValue.some(item => item.product.id === productId);
  }

  clear(): void {
    this.itemsValue = [];
  }

  isEmpty(): boolean {
    return this.itemsValue.length === 0;
  }

  // Método para sincronizar con el servidor cuando el usuario inicie sesión
  syncWithUser(userId: string): void {
    // Aquí podrías implementar la lógica para sincronizar el carrito local
    // con el carrito del usuario en el servidor
    console.log(`Sincronizando carrito para usuario: ${userId}`);
  }
}