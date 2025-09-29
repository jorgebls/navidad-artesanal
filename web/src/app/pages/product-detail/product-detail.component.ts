import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private products = inject(ProductsService);
  private cartService = inject(CartService);

  product: Product | undefined;
  quantity = 1;
  isInCart = false;
  selectedSize = 'M';
  readonly availableSizes = ['XS', 'S', 'M', 'L', 'XL'];

  async ngOnInit() {
    await this.products.seedIfEmpty();
    const id = this.route.snapshot.paramMap.get('id')!;
    this.product = this.products.getById(id);
    if (this.product) {
      const existingItem = this.cartService
        .all()
        .find(item => item.product.id === this.product!.id);
      if (existingItem) {
        this.selectedSize = existingItem.size;
      }
    }

    this.syncCartState();
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.add(this.product, this.quantity, this.selectedSize);
      this.syncCartState();
    }
  }

  onSizeChange(size: string): void {
    this.selectedSize = size.toUpperCase();
    this.syncCartState();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  private syncCartState(): void {
    if (!this.product) {
      this.isInCart = false;
      return;
    }

    const existing = this.cartService.getItem(this.product.id, this.selectedSize);
    if (existing) {
      this.quantity = existing.qty;
      this.isInCart = true;
    } else {
      this.quantity = 1;
      this.isInCart = false;
    }
  }
}
