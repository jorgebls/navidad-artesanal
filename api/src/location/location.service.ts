import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { City } from './city.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async listDepartments() {
    return this.departmentRepo.find({ order: { name: 'ASC' } });
  }

  async listCitiesByDepartment(departmentId: number) {
    const department = await this.departmentRepo.findOne({ where: { id: departmentId } });
    if (!department) {
      throw new NotFoundException('Departamento no encontrado');
    }
    return this.cityRepo.find({
      where: { departmentId },
      order: { name: 'ASC' },
    });
  }
}

