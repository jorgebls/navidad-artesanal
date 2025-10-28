import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomizationService } from '../../core/services/customization.service';
import { CartService } from '../../core/services/cart.service';
import { Product, CustomizedProduct, CustomizationCategory } from '../../shared/models/product.model';

@Component({
  selector: 'app-customize',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.scss']
})
export class CustomizeComponent implements OnInit, OnDestroy {
  categories: string[] = [];
  selectedCategory: string = '';
  products: Product[] = [];
  selectedProduct: Product | null = null;
  currentCustomization: CustomizedProduct | null = null;
  isCustomizationComplete = false;
  
  private subscription: Subscription = new Subscription();

  constructor(
    private customizationService: CustomizationService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Debug: Verificar que los datos se carguen correctamente
    console.log('Inicializando componente de personalización...');
    
    // Cargar datos inmediatamente
    this.loadData();

    this.subscription.add(
      this.customizationService.getCurrentCustomization().subscribe(customization => {
        this.currentCustomization = customization;
        this.isCustomizationComplete = this.customizationService.isCustomizationComplete();
      })
    );
  }

  private async loadData(): Promise<void> {
    try {
      // Asegurar que los datos estén cargados
      await this.customizationService.productsService.seedIfEmpty();
      
      this.categories = this.customizationService.getProductCategories();
      console.log('Categorías encontradas:', this.categories);
      
      // Si no hay categorías, usar datos de fallback
      if (this.categories.length === 0) {
        console.log('No se encontraron categorías, usando datos de fallback');
        this.loadFallbackData();
        return;
      }
      
      this.selectedCategory = this.categories[0] || '';
      this.loadProducts();
      console.log('Productos cargados:', this.products);
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.loadFallbackData();
    }
  }

  private loadFallbackData(): void {
    // Datos de fallback para testing
    this.categories = ['bola', 'moño', 'caja', 'tambor'];
    this.selectedCategory = this.categories[0];
    this.products = [
      {
        id: 'fallback-1',
        name: 'Bolita navideña',
        description: 'Bolita navideña artesanal personalizable.',
        price: 12000,
        image: 'assets/img/images.jpeg',
        category: 'bola',
        customizable: true,
        sizes: [
          { size: 'XS', price: 9000, description: 'Bolita XS para centros de mesa' },
          { size: 'S', price: 10500, description: 'Bolita S con brillo suave' },
          { size: 'M', price: 12000, description: 'Bolita M tamaño clásico' },
          { size: 'L', price: 13500, description: 'Bolita L para destacar' },
          { size: 'XL', price: 15500, description: 'Bolita XL llamativa' }
        ],
        customizationOptions: [
          {
            id: 'color',
            name: 'Color',
            required: true,
            options: [
              { id: 'rojo', name: 'Rojo', value: 'rojo', price: 0 },
              { id: 'dorado', name: 'Dorado', value: 'dorado', price: 2000 },
              { id: 'plateado', name: 'Plateado', value: 'plateado', price: 2000 },
              { id: 'verde', name: 'Verde', value: 'verde', price: 0 },
              { id: 'azul', name: 'Azul', value: 'azul', price: 0 }
            ]
          },
          {
            id: 'tela',
            name: 'Tipo de Tela',
            required: true,
            options: [
              { id: 'seda', name: 'Seda', value: 'seda', price: 3000 },
              { id: 'terciopelo', name: 'Terciopelo', value: 'terciopelo', price: 2500 },
              { id: 'lino', name: 'Lino', value: 'lino', price: 1000 },
              { id: 'algodon', name: 'Algodón', value: 'algodon', price: 0 }
            ]
          }
        ]
      }
    ];
    console.log('Datos de fallback cargados:', this.products);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onCategoryChange(): void {
    this.loadProducts();
    this.selectedProduct = null;
    this.customizationService.resetCustomization();
  }

  onProductSelect(product: Product): void {
    this.selectedProduct = product;
    this.customizationService.startCustomization(product.id);
  }

  onSizeChange(size: string): void {
    this.customizationService.updateSize(size);
  }

  onCustomizationChange(categoryId: string, optionId: string): void {
    this.customizationService.updateCustomization(categoryId, optionId);
  }

  onQuantityChange(quantity: number): void {
    this.customizationService.updateQuantity(quantity);
  }

  getSelectedCustomization(categoryId: string): string {
    return this.currentCustomization?.customizations[categoryId] || '';
  }

  getCustomizationPrice(categoryId: string, optionId: string): number {
    const option = this.customizationService.getCustomizationOption(categoryId, optionId);
    return option?.price || 0;
  }

  getBasePrice(): number {
    if (!this.currentCustomization) return 0;
    const selectedSize = this.currentCustomization.baseProduct.sizes?.find(s => s.size === this.currentCustomization!.selectedSize);
    return selectedSize?.price || this.currentCustomization.baseProduct.price;
  }

  getUnitPrice(): number {
    if (!this.currentCustomization) return 0;
    let unitPrice = this.getBasePrice();
    
    // Add customization costs
    Object.entries(this.currentCustomization.customizations).forEach(([categoryId, optionId]) => {
      const option = this.customizationService.getCustomizationOption(categoryId, optionId);
      if (option?.price) {
        unitPrice += option.price;
      }
    });
    
    return unitPrice;
  }

  addToCart(): void {
    const customizedProduct = this.customizationService.addToCart();
    if (customizedProduct) {
      this.cartService.addCustomized(customizedProduct);
      alert('Producto personalizado agregado al carrito');
      this.router.navigate(['/carrito']);
    } else {
      alert('Por favor completa todas las opciones requeridas');
    }
  }

  resetCustomization(): void {
    this.customizationService.resetCustomization();
    this.selectedProduct = null;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'bola': '🔴',
      'moño': '🎀',
      'caja': '📦',
      'tambor': '🥁'
    };
    return icons[category] || '🎁';
  }

  getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      'bola': 'Bolas',
      'moño': 'Moños',
      'caja': 'Cajas',
      'tambor': 'Tambores'
    };
    return names[category] || category;
  }

  private loadProducts(): void {
    this.products = this.customizationService.getProductsByCategory(this.selectedCategory);
  }
}
