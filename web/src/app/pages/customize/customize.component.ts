import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomizationService } from '../../core/services/customization.service';
import { CartService } from '../../core/services/cart.service';
import {
  Product,
  ProductDesign,
  ProductFabric,
  ProductSizeVariant,
  CustomizedProduct,
} from '../../shared/models/product.model';

@Component({
  selector: 'app-customize-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.scss'],
})
export class CustomizeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customization = inject(CustomizationService);
  private cart = inject(CartService);

  categorySlug = '';
  categoryName = '';
  products: Product[] = [];
  selectedProduct: Product | null = null;
  selectedSize: ProductSizeVariant | null = null;
  selectedDesignId: number | null = null;
  selectedFabricId: number | null = null;
  quantity = 1;
  loading = true;
  error: string | null = null;

  async ngOnInit(): Promise<void> {
    this.categorySlug = this.route.snapshot.paramMap.get('slug') ?? '';
    if (!this.categorySlug) {
      this.router.navigate(['/personalizar']);
      return;
    }

    await this.loadCategoryData();
  }

  get sizes(): ProductSizeVariant[] {
    return this.selectedProduct?.sizes ?? [];
  }

  get designs(): ProductDesign[] {
    return this.selectedProduct?.designs ?? [];
  }

  get fabrics(): ProductFabric[] {
    return this.selectedProduct?.fabrics ?? [];
  }

  get selectedDesign(): ProductDesign | null {
    return this.designs.find((d) => d.id === this.selectedDesignId) ?? null;
  }

  get selectedFabric(): ProductFabric | null {
    return this.fabrics.find((f) => f.id === this.selectedFabricId) ?? null;
  }

  get baseVariantPrice(): number {
    if (!this.selectedProduct) return 0;
    if (this.selectedSize) return this.selectedSize.price;
    return this.selectedProduct.basePrice ?? this.selectedProduct.price;
  }

  get unitPrice(): number {
    let price = this.baseVariantPrice;
    if (this.selectedDesign) price += this.selectedDesign.extraCost ?? 0;
    if (this.selectedFabric) price += this.selectedFabric.extraCost ?? 0;
    return price;
  }

  get totalPrice(): number {
    return this.unitPrice * this.quantity;
  }

  private async loadCategoryData(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      const categories = await this.customization.getCategories();
      const category = categories.find((c) => c.slug === this.categorySlug);
      if (!category) {
        this.error = 'La categoría seleccionada no está disponible en este momento.';
        return;
      }

      this.categoryName = category.name;
      const products = await this.customization.getProductsByCategorySlug(this.categorySlug);
      if (!products.length) {
        this.error = 'No hay productos personalizables disponibles para esta categoría.';
        return;
      }

      this.products = products;
      this.selectProduct(products[0]);
    } catch (err) {
      console.error('Error cargando personalización', err);
      this.error = 'Ocurrió un problema al cargar la personalización.';
    } finally {
      this.loading = false;
    }
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.selectedSize = product.sizes?.[0] ?? null;
    this.selectedDesignId = product.designs?.[0]?.id ?? null;
    this.selectedFabricId = product.fabrics?.[0]?.id ?? null;
    this.quantity = 1;
  }

  selectSize(size: ProductSizeVariant): void {
    this.selectedSize = size;
  }

  selectDesign(design: ProductDesign): void {
    this.selectedDesignId = design.id;
  }

  selectFabric(fabric: ProductFabric): void {
    this.selectedFabricId = fabric.id;
  }

  updateQuantity(value: number | string): void {
    const numeric = typeof value === 'string' ? parseInt(value, 10) : value;
    if (Number.isNaN(numeric)) {
      this.quantity = 1;
      return;
    }
    this.quantity = Math.min(99, Math.max(1, numeric));
  }

  addToCart(): void {
    if (!this.selectedProduct) return;

    const variantSize = this.selectedSize?.size ?? 'ÚNICO';
    const customizations: Record<string, string> = {};
    if (this.selectedDesign) customizations['design'] = String(this.selectedDesign.id);
    if (this.selectedFabric) customizations['fabric'] = String(this.selectedFabric.id);

    const payload: CustomizedProduct = {
      productId: this.selectedProduct.id,
      baseProduct: this.selectedProduct,
      selectedSize: variantSize,
      customizations,
      quantity: this.quantity,
      totalPrice: this.totalPrice,
    };

    this.cart.addCustomized(payload);
    this.router.navigate(['/carrito']);
  }

  colorSwatch(colorHex?: string | null): string {
    if (!colorHex) return '#b71c1c';
    return colorHex.startsWith('#') ? colorHex : `#${colorHex}`;
  }

  goBack(): void {
    this.router.navigate(['/personalizar']);
  }
}
