import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../shared/models/product.model';
import { StorageService } from './storage.service';
import { LS } from './keys';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);

  async seedIfEmpty() {
    const existing = this.storage.get<Product[]>(LS.PRODUCTS, []);
    const needsSeed = existing.length === 0 || existing.some(p => !p.sizes || p.sizes.length === 0);
    if (!needsSeed) return;

    const products = await firstValueFrom(
      this.http.get<Product[]>('assets/data/products.json')
    );
    this.storage.set(LS.PRODUCTS, products);
  }

  getAll(): Product[] {
    const products = this.storage.get<Product[]>(LS.PRODUCTS, []);
    return products.map(p => ({
      ...p,
      sizes: p.sizes?.map(variant => ({
        ...variant,
        size: variant.size.toUpperCase()
      }))
    }));
  }

  getById(id: string): Product | undefined {
    return this.getAll().find(p => p.id === id);
  }
}
