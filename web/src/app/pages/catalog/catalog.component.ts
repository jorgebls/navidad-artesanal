import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService, ProductListResponse, ProductQueryParams } from '../../core/services/products.service';
import { Product } from '../../shared/models/product.model';
import { CategoryService, Category } from '../../core/services/category.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  private svc = inject(ProductsService);
  private categorySvc = inject(CategoryService);
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Array<Category & { icon: string }> = [];
  selectedCategory: string = '';
  private readonly defaultSize = 'M';
  loading = false;

  private readonly categoryMeta: Record<string, { icon: string; name?: string; description?: string }> = {
    bola: { icon: '🔴', name: 'Bolas navideñas', description: 'Bolas navideñas artesanales' },
    mono: { icon: '🎀', name: 'Moños', description: 'Moños decorativos únicos' },
    caja: { icon: '📦', name: 'Cajas decorativas', description: 'Cajas regalo personalizadas' },
    tambor: { icon: '🥁', name: 'Tambores', description: 'Tambores decorativos especiales' },
  };

  async ngOnInit() {
    await this.loadCategories();
    await this.loadProducts();
  }

  async onCategorySelect(categoryId: string): Promise<void> {
    this.selectedCategory = categoryId;
    const params: ProductQueryParams = {};

    if (categoryId) {
      const category = this.categories.find((c) => c.slug === categoryId);
      if (category) {
        params.categoryId = category.id;
      }
    }

    await this.loadProducts(params);
  }

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/img/images.jpeg';
  }

  priceForDefaultSize(product: Product): number {
    const variant = product.sizes?.find(v => v.size.toUpperCase() === this.defaultSize);
    return variant?.price ?? product.price;
  }

  getSelectedCategoryName(): string {
    if (!this.selectedCategory) {
      return 'Todos los Productos';
    }
    const category = this.categories.find((c) => c.slug === this.selectedCategory);
    return category?.name || 'Productos';
  }

  private async loadCategories() {
    try {
      const categories = await firstValueFrom(this.categorySvc.list());
      this.categories = categories.map((cat) => {
        const meta = this.categoryMeta[cat.slug] ?? {};
        return {
          ...cat,
          name: meta.name ?? cat.name,
          description: meta.description ?? cat.description ?? '',
          icon: meta.icon ?? '🎁',
        };
      });
    } catch (err) {
      console.error('Error cargando categorías desde API, usando fallback', err);
      this.categories = Object.entries(this.categoryMeta).map(([slug, meta], idx) => ({
        id: idx + 1,
        slug,
        name: meta.name ?? slug,
        description: meta.description ?? '',
        icon: meta.icon ?? '🎁',
      }));
    }
  }

  private async loadProducts(params: ProductQueryParams = {}) {
    this.loading = true;
    try {
      const response: ProductListResponse = await this.svc.list(params);
      this.products = response.data;
      this.filteredProducts = response.data;
    } catch (err) {
      console.error('Error cargando productos desde API', err);
      this.products = [];
      this.filteredProducts = [];
    } finally {
      this.loading = false;
    }
  }

  private getProductCategorySlug(product: Product): string | null {
    if (!product.category) return null;
    return typeof product.category === 'string' ? product.category : product.category.slug;
  }
}
