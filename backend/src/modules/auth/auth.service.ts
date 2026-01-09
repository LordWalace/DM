// backend/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // ✅ ADICIONAR
  ) {}

  private buildToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  // Cadastro / login normal

  async register(dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new UnauthorizedException('Email já está em uso.');
    }

    const user = await this.usersService.create(dto);
    const { accessToken } = this.buildToken(user);

    return { accessToken, user };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const { accessToken } = this.buildToken(user);

    return { accessToken, user };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  // Login / cadastro via Google
  // Chamado pela GoogleStrategy.validate()

  async validateGoogleUser(payload: {
    googleId: string;
    email: string;
    name?: string;
    googleRefreshToken?: string;
  }) {
    const { email, name, googleRefreshToken } = payload;

    if (!email) {
      throw new UnauthorizedException('Conta Google sem email.');
    }

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // cria usuário a partir dos dados do Google
      user = await this.usersService.createFromGoogle({
        email,
        name,
        googleRefreshToken,
      });
    } else if (googleRefreshToken) {
      // opcional: atualizar refresh_token se mudou
      user = await this.usersService.updateGoogleToken(
        user.id,
        googleRefreshToken,
      );
    }

    const { accessToken } = this.buildToken(user);

    return { accessToken, user };
  }
}