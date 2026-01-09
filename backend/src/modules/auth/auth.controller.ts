import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
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

  // 1) Redireciona para login do Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // redirecionamento é feito automaticamente pelo Passport
  }

  // 2) Callback/redirect do Google
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req: any) {
    // req.user vem do validate() da GoogleStrategy
    return req.user; // { accessToken, user }
  }
}