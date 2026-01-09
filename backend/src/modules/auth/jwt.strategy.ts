// src/modules/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    
    // ✅ Validação: Se não encontrar o JWT_SECRET, lança erro
    if (!secret) {
      throw new Error('JWT_SECRET não está definido no arquivo .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // ✅ Agora o TypeScript sabe que é string
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      // se retornar null/undefined, o guard responde 401
      return null;
    }

    // Isso vira request.user
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      timezone: user.timezone,
    };
  }
}