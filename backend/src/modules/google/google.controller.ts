// src/modules/google/google.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { GoogleService } from './google.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@Controller('google')
@UseGuards(JwtAuthGuard)
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  // URL para o frontend redirecionar o usuário ao login do Google
  @Get('oauth/url')
  getOAuthUrl() {
    const url = this.googleService.getAuthUrl()
    return { url }
  }

  // Callback depois do login do Google
  @Get('oauth/callback')
  async oauthCallback(
    @CurrentUser() user: any,
    @Query('code') code: string,
  ) {
    await this.googleService.handleOAuthCallback(code, user.id)
    return { message: 'Conta Google conectada com sucesso' }
  }
}