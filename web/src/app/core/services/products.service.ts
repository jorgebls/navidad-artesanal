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
    console.log('Productos existentes en storage:', existing);
    const needsSeed = existing.length === 0 || existing.some(p => !p.sizes || p.sizes.length === 0 || !p.hasOwnProperty('customizable'));
    console.log('¿Necesita seed?', needsSeed);
    
    // Forzar recarga para mostrar los nuevos productos
    if (!needsSeed && existing.length < 10) {
      console.log('Forzando recarga de productos para mostrar ejemplos completos');
    }
    
    if (!needsSeed && existing.length >= 10) return;

    try {
      const products = await firstValueFrom(
        this.http.get<Product[]>('assets/data/products.json')
      );
      console.log('Productos cargados desde JSON:', products);
      this.storage.set(LS.PRODUCTS, products);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
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

  clearStorage(): void {
    this.storage.remove(LS.PRODUCTS);
    console.log('Storage de productos limpiado');
  }
}
