import { Injectable, inject } from '@angular/core';
import { ProductsService } from './products.service';
import { Product, CustomizedProduct, CustomizationCategory, CustomizationOption } from '../../shared/models/product.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomizationService {
  public productsService = inject(ProductsService);
  private currentCustomization = new BehaviorSubject<CustomizedProduct | null>(null);

  getCurrentCustomization(): Observable<CustomizedProduct | null> {
    return this.currentCustomization.asObservable();
  }

  getCustomizableProducts(): Product[] {
    const allProducts = this.productsService.getAll();
    console.log('Todos los productos:', allProducts);
    const customizableProducts = allProducts.filter(product => product.customizable);
    console.log('Productos personalizables:', customizableProducts);
    return customizableProducts;
  }

  getProductCategories(): string[] {
    const products = this.getCustomizableProducts();
    return [...new Set(products.map(p => p.category))];
  }

  getProductsByCategory(category: string): Product[] {
    return this.getCustomizableProducts().filter(product => product.category === category);
  }

  startCustomization(productId: string): CustomizedProduct | null {
    const product = this.productsService.getById(productId);
    if (!product || !product.customizable) {
      return null;
    }

    const customizedProduct: CustomizedProduct = {
      productId: product.id,
      baseProduct: product,
      selectedSize: product.sizes?.[0]?.size || '',
      customizations: {},
      quantity: 1,
      totalPrice: product.sizes?.[0]?.price || product.price
    };

    this.currentCustomization.next(customizedProduct);
    return customizedProduct;
  }

  updateSize(size: string): void {
    const current = this.currentCustomization.value;
    if (!current) return;

    const sizeVariant = current.baseProduct.sizes?.find(s => s.size === size);
    if (!sizeVariant) return;

    current.selectedSize = size;
    current.totalPrice = this.calculateTotalPrice(current);
    this.currentCustomization.next({ ...current });
  }

  updateCustomization(categoryId: string, optionId: string): void {
    const current = this.currentCustomization.value;
    if (!current) return;

    current.customizations[categoryId] = optionId;
    current.totalPrice = this.calculateTotalPrice(current);
    this.currentCustomization.next({ ...current });
  }

  updateQuantity(quantity: number): void {
    const current = this.currentCustomization.value;
    if (!current || quantity < 1) return;

    current.quantity = quantity;
    current.totalPrice = this.calculateTotalPrice(current);
    this.currentCustomization.next({ ...current });
  }

  getCustomizationOption(categoryId: string, optionId: string): CustomizationOption | null {
    const current = this.currentCustomization.value;
    if (!current) return null;

    const category = current.baseProduct.customizationOptions?.find(c => c.id === categoryId);
    return category?.options.find(o => o.id === optionId) || null;
  }

  getSelectedCustomization(categoryId: string): CustomizationOption | null {
    const current = this.currentCustomization.value;
    if (!current) return null;

    const selectedOptionId = current.customizations[categoryId];
    if (!selectedOptionId) return null;

    return this.getCustomizationOption(categoryId, selectedOptionId);
  }

  isCustomizationComplete(): boolean {
    const current = this.currentCustomization.value;
    if (!current) return false;

    const requiredCategories = current.baseProduct.customizationOptions?.filter(c => c.required) || [];
    return requiredCategories.every(category => 
      current.customizations[category.id] && 
      this.getCustomizationOption(category.id, current.customizations[category.id])
    );
  }

  private calculateTotalPrice(customizedProduct: CustomizedProduct): number {
    let unitPrice = customizedProduct.baseProduct.sizes?.find(s => s.size === customizedProduct.selectedSize)?.price || customizedProduct.baseProduct.price;

    // Add customization costs
    Object.entries(customizedProduct.customizations).forEach(([categoryId, optionId]) => {
      const option = this.getCustomizationOption(categoryId, optionId);
      if (option?.price) {
        unitPrice += option.price;
      }
    });

    // Multiply by quantity
    return unitPrice * customizedProduct.quantity;
  }

  resetCustomization(): void {
    this.currentCustomization.next(null);
  }

  addToCart(): CustomizedProduct | null {
    const current = this.currentCustomization.value;
    if (!current || !this.isCustomizationComplete()) {
      return null;
    }

    // Here you would typically add to cart service
    // For now, we'll just return the customized product
    return current;
  }
}
