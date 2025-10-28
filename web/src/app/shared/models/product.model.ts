export interface ProductSizeVariant {
  size: string;
  price: number;
  description: string;
  image?: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  value: string;
  price?: number;
  image?: string;
}

export interface CustomizationCategory {
  id: string;
  name: string;
  options: CustomizationOption[];
  required: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes?: ProductSizeVariant[];
  category: 'bola' | 'moño' | 'caja' | 'tambor';
  customizable: boolean;
  customizationOptions?: CustomizationCategory[];
}

export interface CustomizedProduct {
  productId: string;
  baseProduct: Product;
  selectedSize: string;
  customizations: { [categoryId: string]: string };
  quantity: number;
  totalPrice: number;
}
