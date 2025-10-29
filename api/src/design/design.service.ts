import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design } from './design.entity';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { QueryDesignDto } from './dto/query-design.dto';
import { Product } from '../product/product.entity';

@Injectable()
export class DesignService {
  constructor(
    @InjectRepository(Design) private readonly designs: Repository<Design>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  async findAll(query: QueryDesignDto) {
    const qb = this.designs.createQueryBuilder('design');

    if (query.search) {
      qb.andWhere('LOWER(design.name) LIKE LOWER(:search)', { search: `%${query.search}%` });
    }

    if (query.categoryId !== undefined) {
      qb.andWhere('design.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    qb.orderBy('design.name', 'ASC');

    return qb.getMany();
  }

  async findOne(id: number) {
    const design = await this.designs.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!design) throw new NotFoundException('Diseño no encontrado');
    return design;
  }

  async create(dto: CreateDesignDto) {
    const design = this.designs.create({
      ...dto,
      extraCost: dto.extraCost ?? '0',
      colorHex: dto.colorHex ? dto.colorHex.replace('#', '').toUpperCase() : undefined,
    });
    return this.designs.save(design);
  }

  async update(id: number, dto: UpdateDesignDto) {
    const design = await this.designs.findOne({ where: { id } });
    if (!design) throw new NotFoundException('Diseño no encontrado');

    Object.assign(design, {
      ...dto,
      ...(dto.extraCost !== undefined ? { extraCost: dto.extraCost } : {}),
      ...(dto.colorHex !== undefined
        ? { colorHex: dto.colorHex ? dto.colorHex.replace('#', '').toUpperCase() : null }
        : {}),
    });

    return this.designs.save(design);
  }

  async remove(id: number) {
    const design = await this.designs.findOne({ where: { id }, relations: { products: true } });
    if (!design) throw new NotFoundException('Diseño no encontrado');
    await this.designs.remove(design);
    return { ok: true };
  }

  async attachToProduct(productId: string, designId: number) {
    const product = await this.products.findOne({
      where: { id: productId },
      relations: { designs: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const design = await this.designs.findOne({ where: { id: designId } });
    if (!design) throw new NotFoundException('Diseño no encontrado');

    const already = product.designs?.some((d) => d.id === designId);
    if (already) return product.designs;

    product.designs = [...(product.designs ?? []), design];
    await this.products.save(product);
    return product.designs;
  }

  async detachFromProduct(productId: string, designId: number) {
    const product = await this.products.findOne({
      where: { id: productId },
      relations: { designs: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    product.designs = (product.designs ?? []).filter((d) => d.id !== designId);
    await this.products.save(product);
    return product.designs;
  }

  async listByProduct(productId: string) {
    const product = await this.products.findOne({
      where: { id: productId },
      relations: { designs: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product.designs ?? [];
  }
}
