import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fabric } from './fabric.entity';
import { CreateFabricDto } from './dto/create-fabric.dto';
import { UpdateFabricDto } from './dto/update-fabric.dto';
import { QueryFabricDto } from './dto/query-fabric.dto';
import { Product } from '../product/product.entity';

@Injectable()
export class FabricService {
  constructor(
    @InjectRepository(Fabric) private readonly fabrics: Repository<Fabric>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  async findAll(query: QueryFabricDto) {
    const qb = this.fabrics.createQueryBuilder('fabric');

    if (query.search) {
      qb.andWhere('LOWER(fabric.name) LIKE LOWER(:search)', { search: `%${query.search}%` });
    }

    if (query.type) {
      qb.andWhere('LOWER(fabric.type) = LOWER(:type)', { type: query.type });
    }

    qb.orderBy('fabric.name', 'ASC');

    return qb.getMany();
  }

  async findOne(id: number) {
    const fabric = await this.fabrics.findOne({ where: { id } });
    if (!fabric) throw new NotFoundException('Tela no encontrada');
    return fabric;
  }

  async create(dto: CreateFabricDto) {
    const fabric = this.fabrics.create({
      ...dto,
      extraCost: dto.extraCost ?? '0',
      colorHex: dto.colorHex ? dto.colorHex.replace('#', '').toUpperCase() : undefined,
    });
    return this.fabrics.save(fabric);
  }

  async update(id: number, dto: UpdateFabricDto) {
    const fabric = await this.fabrics.findOne({ where: { id } });
    if (!fabric) throw new NotFoundException('Tela no encontrada');

    Object.assign(fabric, {
      ...dto,
      ...(dto.extraCost !== undefined ? { extraCost: dto.extraCost } : {}),
      ...(dto.colorHex !== undefined
        ? { colorHex: dto.colorHex ? dto.colorHex.replace('#', '').toUpperCase() : null }
        : {}),
    });

    return this.fabrics.save(fabric);
  }

  async remove(id: number) {
    const fabric = await this.fabrics.findOne({ where: { id }, relations: { products: true } });
    if (!fabric) throw new NotFoundException('Tela no encontrada');
    await this.fabrics.remove(fabric);
    return { ok: true };
  }

  async attachToProduct(productId: string, fabricId: number) {
    const product = await this.products.findOne({
      where: { id: productId },
      relations: { fabrics: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const fabric = await this.fabrics.findOne({ where: { id: fabricId } });
    if (!fabric) throw new NotFoundException('Tela no encontrada');

    const already = product.fabrics?.some((f) => f.id === fabricId);
    if (already) return product.fabrics;

    product.fabrics = [...(product.fabrics ?? []), fabric];
    await this.products.save(product);
    return product.fabrics;
  }

  async detachFromProduct(productId: string, fabricId: number) {
    const product = await this.products.findOne({
      where: { id: productId },
      relations: { fabrics: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    product.fabrics = (product.fabrics ?? []).filter((f) => f.id !== fabricId);
    await this.products.save(product);
    return product.fabrics;
  }

  async listByProduct(productId: string) {
    const product = await this.products.findOne({
      where: { id: productId },
      relations: { fabrics: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product.fabrics ?? [];
  }
}
