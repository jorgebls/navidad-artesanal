import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  private svc = inject(ProductsService);
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = '';
  private readonly defaultSize = 'M';

  // Definir las 4 categorías principales
  categories = [
    { id: 'bola', name: 'Bolas', icon: '🔴', description: 'Bolas navideñas artesanales' },
    { id: 'moño', name: 'Moños', icon: '🎀', description: 'Moños decorativos únicos' },
    { id: 'caja', name: 'Cajas', icon: '📦', description: 'Cajas regalo personalizadas' },
    { id: 'tambor', name: 'Tambores', icon: '🥁', description: 'Tambores decorativos especiales' }
  ];

  async ngOnInit() {
    // Limpiar storage para forzar recarga de productos
    this.svc.clearStorage();
    
    await this.svc.seedIfEmpty();    
    this.products = this.svc.getAll();
    console.log('products:', this.products);
    
    // Mostrar todos los productos por defecto
    this.filteredProducts = this.products;
  }

  onCategorySelect(categoryId: string): void {
    this.selectedCategory = categoryId;
    if (categoryId === '') {
      // Mostrar todos los productos
      this.filteredProducts = this.products;
    } else {
      // Filtrar productos por categoría
      this.filteredProducts = this.products.filter(product => 
        product.category?.toLowerCase() === categoryId.toLowerCase()
      );
    }
  }

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/img/images.jpg';
  }

  priceForDefaultSize(product: Product): number {
    const variant = product.sizes?.find(v => v.size.toUpperCase() === this.defaultSize);
    return variant?.price ?? product.price;
  }

  getSelectedCategoryName(): string {
    if (!this.selectedCategory) {
      return 'Todos los Productos';
    }
    const category = this.categories.find(c => c.id === this.selectedCategory);
    return category?.name || 'Productos';
  }
}
