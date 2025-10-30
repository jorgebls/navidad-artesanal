import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.repo.find();
    return users.map((user) => this.strip(user));
  }

  async create(dto: CreateUserDto) {
    const user = this.repo.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone.trim(),
      documentId: dto.documentId.trim(),
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    const saved = await this.repo.save(user);
    return this.strip(saved);
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.email) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      if (normalizedEmail !== user.email) {
        const exists = await this.repo.findOne({ where: { email: normalizedEmail } });
        if (exists && exists.id !== userId) {
          throw new ConflictException('Email ya registrado');
        }
        user.email = normalizedEmail;
      }
    }

    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName.trim();
    }
    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName.trim();
    }
    if (dto.phone !== undefined) {
      user.phone = dto.phone.trim();
    }
    if (dto.documentId !== undefined) {
      user.documentId = dto.documentId.trim();
    }
    const saved = await this.repo.save(user);
    return this.strip(saved);
  }

  private strip(user: User) {
    const { passwordHash, ...safe } = user as User & { passwordHash?: string };
    return safe;
  }
}
