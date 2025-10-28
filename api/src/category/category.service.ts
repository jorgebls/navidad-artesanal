import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateCategoryDto) {
    const category = this.repo.create(dto);
    return this.repo.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    Object.assign(category, dto);
    return this.repo.save(category);
  }

  async remove(id: number) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    await this.repo.remove(category);
    return { ok: true };
  }
}
