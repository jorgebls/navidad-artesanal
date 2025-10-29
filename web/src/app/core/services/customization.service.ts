import { Injectable, inject } from '@angular/core';
import { ProductsService, ProductQueryParams } from './products.service';
import { Product } from '../../shared/models/product.model';

interface CategorySummary {
  slug: string;
  id: number;
  name: string;
  description?: string | null;
  productCount: number;
}

@Injectable({ providedIn: 'root' })
export class CustomizationService {
  private productsService = inject(ProductsService);

  private cacheAll: Product[] | null = null;
  private categoriesCache: CategorySummary[] | null = null;
  private loading: Promise<Product[]> | null = null;

  async loadAll(force = false): Promise<Product[]> {
    if (!force && this.cacheAll) {
      return this.cacheAll;
    }

    if (this.loading) {
      return this.loading;
    }

    const params: ProductQueryParams = { customizable: true, limit: 100, sortBy: 'name', sortOrder: 'ASC' };
    this.loading = this.productsService
      .list(params)
      .then(({ data }) => {
        this.cacheAll = data;
        this.categoriesCache = null;
        return data;
      })
      .finally(() => {
        this.loading = null;
      });

    return this.loading;
  }

  async getCategories(force = false): Promise<CategorySummary[]> {
    if (!force && this.categoriesCache) {
      return this.categoriesCache;
    }

    const products = await this.loadAll(force);

    const summaryMap = new Map<string, CategorySummary>();

    products.forEach((product) => {
      if (!product.category || typeof product.category === 'string') return;
      const slug = product.category.slug;
      const existing = summaryMap.get(slug);
      if (existing) {
        existing.productCount += 1;
      } else {
        summaryMap.set(slug, {
          slug,
          id: product.category.id,
          name: product.category.name,
          description: product.category.description ?? null,
          productCount: 1,
        });
      }
    });

    this.categoriesCache = Array.from(summaryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    return this.categoriesCache;
  }

  async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    const products = await this.loadAll();
    return products.filter((product) => {
      if (!product.category) return false;
      if (typeof product.category === 'string') return product.category === slug;
      return product.category.slug === slug;
    });
  }

  clearCache(): void {
    this.cacheAll = null;
    this.categoriesCache = null;
    this.loading = null;
  }
}
