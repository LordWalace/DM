import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
  handleRequest(err: any, user: any) {
    // Se não há erro e tem usuário, retorna o usuário
    if (!err && user) {
      return user;
    }
    // Se há erro ou não tem usuário, lança Unauthorized
    if (err) {
      throw err;
    }
    throw new UnauthorizedException('Token inválido ou não fornecido');
  }
}