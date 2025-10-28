import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductService {
  private supa;
  private bucket: string;

  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
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
    const { search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    
    // Construir las opciones de búsqueda
    const findOptions: FindManyOptions<Product> = {
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    };

    // Agregar filtros de búsqueda si se proporciona
    if (search) {
      findOptions.where = [
        { name: Like(`%${search}%`) },
        { description: Like(`%${search}%`) },
      ];
    }

    // Obtener productos y total
    const [items, total] = await this.repo.findAndCount(findOptions);

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
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Producto no encontrado');
    const coverUrl = await this.signCover(p);
    const { coverPath, ...rest } = p as any;
    return { ...rest, coverUrl };
  }

  async create(dto: CreateProductDto) {
    const product = this.repo.create(dto);
    return this.repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Producto no encontrado');
    Object.assign(p, dto);
    return this.repo.save(p);
  }

  async remove(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Producto no encontrado');
    await this.repo.remove(p);
    return { ok: true };
  }
}