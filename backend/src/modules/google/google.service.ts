// src/modules/google/google.service.ts
import { Injectable } from '@nestjs/common'
import { google, calendar_v3 } from 'googleapis'
import { PrismaService } from '../../config/prisma.service'
import { User } from '@prisma/client'

@Injectable()
export class GoogleService {
  private clientId = process.env.GOOGLE_CLIENT_ID!
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  private redirectUri = process.env.GOOGLE_REDIRECT_URI!

  constructor(private readonly prisma: PrismaService) {}

  private createOAuthClient() {
    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri,
    )
  }

  getAuthUrl(): string {
    const oAuth2Client = this.createOAuthClient()

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ]

    const url = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
    })

    return url
  }

  async handleOAuthCallback(code: string, userId: string) {
    const oAuth2Client = this.createOAuthClient()

    const { tokens } = await oAuth2Client.getToken(code)
    const { refresh_token } = tokens

    if (!refresh_token) {
      throw new Error('Nenhum refresh_token retornado pelo Google')
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        googleRefreshToken: refresh_token,
      },
    })

    return { success: true }
  }

  async revokeToken(refreshToken: string) {
    const oAuth2Client = this.createOAuthClient()
    oAuth2Client.setCredentials({ refresh_token: refreshToken })

    try {
      await oAuth2Client.revokeToken(refreshToken)
    } catch (e) {
      console.error('Erro ao revogar token do Google:', e)
    }
  }

  private async getCalendarClient(user: User): Promise<calendar_v3.Calendar> {
    if (!user.googleRefreshToken) {
      throw new Error('Usuário não conectado ao Google')
    }

    const oAuth2Client = this.createOAuthClient()
    oAuth2Client.setCredentials({
      refresh_token: user.googleRefreshToken,
    })

    return google.calendar({ version: 'v3', auth: oAuth2Client })
  }

  async createEventFromTask(userId: string, taskId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) throw new Error('Usuário não encontrado')

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    })
    if (!task) throw new Error('Task não encontrada')

    const calendar = await this.getCalendarClient(user)

    const start = task.date
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    const event: calendar_v3.Schema$Event = {
      summary: task.title,
      description: task.description || '',
      start: {
        dateTime: start.toISOString(),
        timeZone: user.timezone || 'America/Sao_Paulo',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: user.timezone || 'America/Sao_Paulo',
      },
    }

    const calendarId = user.googleCalendarId || 'primary'

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    })

    return response.data
  }
}