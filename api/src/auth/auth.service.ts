import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { ConflictException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    const { password: _, ...safe } = user;
    return safe;
  }

  async login(email: string, password: string) {
    const safe = await this.validateUser(email, password);
    if (!safe) throw new UnauthorizedException('Credenciales inválidas');
    const payload = { sub: safe.id, email: safe.email };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token };
  }

  async register(dto: RegisterDto) {
    const exists = await this.users.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email ya registrado');

    const user = this.users.create({
      name: dto.name,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
    });
    const saved = await this.users.save(user);
    const { password, ...safe } = saved;
    return safe; // no devolvemos password
  }
}