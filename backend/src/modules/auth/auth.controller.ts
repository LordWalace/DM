import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express'; // ✅ Corrigido: importação com 'type'
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return req.user;
  }

  // =======================
  // Google OAuth
  // =======================

  // 1) Inicia o fluxo OAuth do Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // O Passport redireciona automaticamente para o Google
  }

  // 2) Callback do Google - redireciona para o frontend com token
  @Get('google/oauth/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    // req.user vem do validate() da GoogleStrategy
    const { accessToken } = req.user;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redireciona para o frontend com o token na URL
    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }
}