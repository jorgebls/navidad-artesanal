import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (err) {
      // Sin token o token inválido: dejamos pasar como invitado
      return true;
    }
  }

  handleRequest(err: any, user: any) {
    if (err) {
      throw err;
    }
    return user ?? null;
  }
}

