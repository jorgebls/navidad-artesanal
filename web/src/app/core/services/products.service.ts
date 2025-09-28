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
    if (existing.length > 0) return;

    const products = await firstValueFrom(
      this.http.get<Product[]>('assets/data/products.json')
    );
    this.storage.set(LS.PRODUCTS, products);
  }

  getAll(): Product[] {
    return this.storage.get<Product[]>(LS.PRODUCTS, []);
  }

  getById(id: string): Product | undefined {
    return this.getAll().find(p => p.id === id);
  }
}