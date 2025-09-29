export interface ProductSizeVariant {
  size: string;
  price: number;
  description: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes?: ProductSizeVariant[];
}
