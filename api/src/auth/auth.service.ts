import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';

export interface AuthResponse {
  access_token: string;
  user: Omit<User, 'passwordHash'>;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  private toSafeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...safe } = user as User & { passwordHash?: string };
    return safe;
  }

  private async findUserForAuth(email: string) {
    const normalized = email.trim().toLowerCase();
    return this.users.findOne({
      where: { email: normalized },
      select: ['id', 'email', 'passwordHash', 'firstName', 'lastName', 'phone', 'documentId', 'createdAt'],
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.findUserForAuth(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return user;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    return this.buildAuthResponse(user);
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const exists = await this.users.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email ya registrado');

    const user = this.users.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone.trim(),
      documentId: dto.documentId.trim(),
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    const saved = await this.users.save(user);
    return this.buildAuthResponse(saved);
  }

  async profile(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return this.toSafeUser(user);
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token, user: this.toSafeUser(user) };
  }
}
