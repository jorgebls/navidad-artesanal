import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';
import { Product, ProductSizeVariant } from '../../shared/models/product.model';

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
  selectedSize = '';

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.product = await this.products.getById(id);

    if (this.product) {
      this.selectedSize = this.resolveInitialSize();
      this.syncCartState();
    }
  }

  addToCart(): void {
    if (!this.product) return;

    const variant = this.selectedVariant;
    const productSnapshot: Product = {
      ...this.product,
      price: variant?.price ?? this.product.price,
      description: variant?.description ?? this.product.description,
      image: variant?.image ?? this.product.coverUrl ?? this.product.image
    };

    this.cartService.add(productSnapshot, this.quantity, this.selectedSize);
    this.syncCartState();
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

    this.ensureValidSize();

    const existing = this.cartService.getItem(this.product.id, this.selectedSize);
    if (existing) {
      this.quantity = existing.qty;
      this.isInCart = true;
    } else {
      this.quantity = 1;
      this.isInCart = false;
    }
  }

  get availableSizes(): string[] {
    const variants = this.product?.sizes;
    if (!variants || variants.length === 0) {
      return [];
    }
    return variants.map((variant) => this.variantKey(variant));
  }

  sizeLabel(size: string): string {
    const variant = this.product?.sizes?.find((v) => this.variantKey(v) === size);
    return variant?.sizeName ?? variant?.sizeCode ?? size;
  }

  get selectedVariant(): ProductSizeVariant | undefined {
    const variants = this.product?.sizes;
    if (!variants || variants.length === 0) return undefined;
    return variants.find((v) => this.variantKey(v) === this.selectedSize) || variants[0];
  }

  get currentPrice(): number {
    if (this.selectedVariant) return this.selectedVariant.price;
    return this.product?.price ?? 0;
  }

  get currentDescription(): string {
    if (this.selectedVariant) return this.selectedVariant.description;
    return this.product?.description ?? '';
  }

  get currentImage(): string {
    if (this.selectedVariant?.image) return this.selectedVariant.image;
    if (this.product?.coverUrl) return this.product.coverUrl;
    return this.product?.image ?? '';
  }

  private resolveInitialSize(): string {
    if (!this.product) {
      return '';
    }

    const cartMatch = this.cartService
      .all()
      .find(item => item.product.id === this.product!.id);
    if (cartMatch) {
      return cartMatch.size.toUpperCase();
    }

    const variants = this.product.sizes;
    if (!variants || variants.length === 0) {
      return '';
    }

    return this.variantKey(variants[0]);
  }

  private ensureValidSize(): void {
    const sizes = this.availableSizes;
    if (sizes.length === 0) {
      this.selectedSize = 'UNIQUE';
      return;
    }
    if (!sizes.includes(this.selectedSize)) {
      this.selectedSize = sizes[0];
    }
  }

  private variantKey(variant: ProductSizeVariant): string {
    if (!variant) return '';
    const code = variant.sizeCode ?? variant.sizeName ?? String(variant.sizeId);
    return code.toUpperCase();
  }
}
