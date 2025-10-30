import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Product } from '../../shared/models/product.model';

export interface ProductQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  sortBy?: 'createdAt' | 'name' | 'basePrice' | 'stock';
  sortOrder?: 'ASC' | 'DESC';
  categoryId?: number;
  customizable?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductListResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

type RawProduct = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/product';

  private cache = new Map<string, Product>();
  private lastList: Product[] = [];

  async list(params: ProductQueryParams = {}): Promise<ProductListResponse> {
    const normalized: ProductQueryParams = { limit: params.limit ?? 50, ...params };
    const httpParams = this.toHttpParams(normalized);
    const response = await firstValueFrom(
      this.http.get<{ data: RawProduct[]; pagination: ProductListResponse['pagination'] }>(this.baseUrl, {
        params: httpParams,
      }),
    );

    const data = response.data.map((raw) => this.normalizeProduct(raw));
    data.forEach((product) => this.cache.set(product.id, product));
    this.lastList = data;

    return { data, pagination: response.pagination };
  }

  async getById(id: string): Promise<Product | undefined> {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    const raw = await firstValueFrom(this.http.get<RawProduct>(`${this.baseUrl}/${id}`));
    const product = this.normalizeProduct(raw);
    this.cache.set(product.id, product);
    return product;
  }

  getCachedList(): Product[] {
    return [...this.lastList];
  }

  private toHttpParams(params: ProductQueryParams): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      httpParams = httpParams.set(key, String(value));
    });
    return httpParams;
  }

  private normalizeProduct(raw: RawProduct): Product {
    const basePrice = raw['basePrice'] !== undefined ? Number(raw['basePrice']) : raw['price'] ?? 0;
    const coverUrl = raw['coverUrl'] ?? raw['image'] ?? null;
    const categoryRaw = raw['category'];
    const categoryId =
      raw['categoryId'] ??
      (typeof categoryRaw === 'object' && categoryRaw
        ? categoryRaw.id
        : undefined) ??
      null;

    const categorySizesRaw: any[] = Array.isArray(categoryRaw?.sizes) ? categoryRaw.sizes : [];
    const mappedCategory =
      categoryRaw && typeof categoryRaw === 'object'
        ? {
            id: Number(categoryRaw.id),
            slug: ((categoryRaw.slug ?? categoryRaw.name ?? '') as string).toLowerCase(),
            name: categoryRaw.name ?? '',
            description: categoryRaw.description ?? null,
            sizes: categorySizesRaw.map((size: any) => ({
              id: Number(size.id),
              code: String(size.code ?? '').toUpperCase(),
              name: size.name ?? '',
              description: size.description ?? null,
            })),
          }
        : undefined;

    const sanitizeColor = (value?: string | null) =>
      value ? `#${value.replace('#', '').toUpperCase()}` : undefined;

    const designs = (raw['designs'] ?? []).map((design: any) => ({
      id: Number(design.id),
      name: design.name ?? '',
      description: design.description ?? null,
      colorHex: sanitizeColor(design.colorHex) ?? null,
      imageUrl: design.imageUrl ?? null,
      extraCost: Number(design.extraCost ?? 0),
      categoryId: design.categoryId ?? null,
    }));

    const fabrics = (raw['fabrics'] ?? []).map((fabric: any) => ({
      id: Number(fabric.id),
      name: fabric.name ?? '',
      type: fabric.type ?? null,
      description: fabric.description ?? null,
      colorHex: sanitizeColor(fabric.colorHex) ?? null,
      extraCost: Number(fabric.extraCost ?? 0),
    }));

    return {
      id: String(raw['id']),
      name: raw['name'] ?? '',
      description: raw['description'] ?? '',
      price: basePrice,
      basePrice,
      image: coverUrl ?? '',
      coverUrl,
      stock: raw['stock'] ?? 0,
      customizable: Boolean(raw['customizable']),
      category: mappedCategory,
      categoryId,
      sizes: (raw['sizes'] ?? []).map((variant: any) => {
        const sizeId = Number(variant.sizeId);
        const sizeMeta = mappedCategory?.sizes?.find((size) => size.id === sizeId);
        return {
          sizeId,
          price: Number(variant.price ?? 0),
          description: variant.description ?? '',
          image: variant.image ?? undefined,
          sizeCode: sizeMeta?.code ?? null,
          sizeName: sizeMeta?.name ?? null,
        };
      }),
      customizationOptions: raw['customizationOptions'] ?? [],
      createdAt: raw['createdAt'] ?? null,
      designs,
      fabrics,
    };
  }
}
