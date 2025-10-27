import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.repo.find();
    // Oculta password
    return users.map(({ password, ...safe }) => safe);
  }

  async create(dto: CreateUserDto) {
    const user = this.repo.create({
      name: dto.name,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
    });
    const saved = await this.repo.save(user);
    const { password, ...safe } = saved;
    return safe;
  }
}