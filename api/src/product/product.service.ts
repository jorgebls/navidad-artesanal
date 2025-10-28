import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { Category } from '../category/category.entity';


@Injectable()
export class ProductService {
  private supa;
  private bucket: string;

  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    private readonly cfg: ConfigService,
  ) {
    this.supa = createClient(
      this.cfg.get<string>('SUPABASE_URL')!,
      this.cfg.get<string>('SUPABASE_SERVICE_ROLE')!,
    );
    this.bucket = this.cfg.get<string>('SUPABASE_BUCKET') || 'products';
  }

  private async signCover(p: Product): Promise<string | null> {
    if (!p.coverPath) return null;
    const { data, error } = await this.supa
      .storage
      .from(this.bucket)
      .createSignedUrl(p.coverPath, 60 * 60); // 1 hora
    return error ? null : data.signedUrl;
  }

  async findAll(query: QueryProductDto) {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      sort,
      categoryId,
      customizable,
      minPrice,
      maxPrice,
    } = query;

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException('minPrice no puede ser mayor que maxPrice');
    }

    const qb = this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId !== undefined) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (typeof customizable === 'boolean') {
      qb.andWhere('product.customizable = :customizable', { customizable });
    }

    if (minPrice !== undefined) {
      qb.andWhere('product.basePrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('product.basePrice <= :maxPrice', { maxPrice });
    }

    const allowedSorts: Array<keyof Product> = ['createdAt', 'name', 'basePrice', 'stock'];
    let sanitizedSort: string = allowedSorts.includes(sortBy as keyof Product) ? sortBy : 'createdAt';
    let sanitizedOrder: 'ASC' | 'DESC' = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    if (sort) {
      const [rawField, rawDirection] = sort.split(':').map((part) => part?.trim());
      if (rawField && allowedSorts.includes(rawField as keyof Product)) {
        sanitizedSort = rawField;
      }
      if (rawDirection) {
        const normalized = rawDirection.toUpperCase();
        if (normalized === 'ASC' || normalized === 'DESC') {
          sanitizedOrder = normalized;
        }
      }
    }

    qb.orderBy(`product.${sanitizedSort}`, sanitizedOrder);

    const [items, total] = await qb.getManyAndCount();

    // Procesar URLs de imágenes
    const processedItems = await Promise.all(
      items.map(async (p) => {
        const coverUrl = await this.signCover(p);
        const { coverPath, ...rest } = p as any;
        return { ...rest, coverUrl };
      }),
    );

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: processedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!p) throw new NotFoundException('Producto no encontrado');
    const coverUrl = await this.signCover(p);
    const { coverPath, ...rest } = p as any;
    return { ...rest, coverUrl };
  }

  async create(dto: CreateProductDto) {
    const { categoryId, ...rest } = dto;
    let category: Category | null = null;

    if (categoryId !== undefined) {
      category = await this.categories.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    const product = this.repo.create({
      ...(rest as Partial<Product>),
      category: category ?? null,
    }) as Product;

    return this.repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Producto no encontrado');
    const { categoryId, ...rest } = dto;
    Object.assign(existing, rest as Partial<Product>);

    if (categoryId !== undefined) {
      const category = await this.categories.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
      existing.category = category;
    }

    return this.repo.save(existing);
  }

  async remove(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Producto no encontrado');
    await this.repo.remove(p);
    return { ok: true };
  }
}
