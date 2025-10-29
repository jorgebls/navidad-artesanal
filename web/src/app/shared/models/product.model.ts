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

export interface ProductCategory {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
}

export interface ProductDesign {
  id: number;
  name: string;
  description?: string | null;
  colorHex?: string | null;
  imageUrl?: string | null;
  extraCost: number;
  categoryId?: number | null;
}

export interface ProductFabric {
  id: number;
  name: string;
  type?: string | null;
  description?: string | null;
  colorHex?: string | null;
  extraCost: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  basePrice?: number;
  image?: string;
  coverUrl?: string | null;
  stock?: number;
  createdAt?: string | null;
  sizes?: ProductSizeVariant[];
  category?: ProductCategory | string;
  categoryId?: number | null;
  customizable: boolean;
  customizationOptions?: CustomizationCategory[];
  designs?: ProductDesign[];
  fabrics?: ProductFabric[];
}

export interface CustomizedProduct {
  productId: string;
  baseProduct: Product;
  selectedSize: string;
  customizations: { [categoryId: string]: string };
  quantity: number;
  totalPrice: number;
}
