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

  async ngOnInit() {
    await this.products.seedIfEmpty();
    const id = this.route.snapshot.paramMap.get('id')!;
    this.product = this.products.getById(id);
    
    if (this.product) {
      this.isInCart = this.cartService.hasItem(this.product.id);
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.add(this.product, this.quantity);
      this.isInCart = true;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}