import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI, // Corrigido
      scope: ['openid', 'email', 'profile'], // Adicionado 'openid'
      accessType: 'offline', // Para obter refresh token
      prompt: 'consent', // Sempre pedir consentimento
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName } = profile;

    const email = emails?.[0]?.value;

    const user = await this.authService.validateGoogleUser({
      googleId: id,
      email,
      name: displayName,
      googleRefreshToken: refreshToken,
    });

    done(null, user);
  }
}