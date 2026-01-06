// src/modules/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId,
        taskId: dto.taskId,
        title: dto.title,
        body: dto.body,
        sendAt: new Date(dto.sendAt),
      },
    });
  }

  async findForUser(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { sendAt: 'asc' },
    });
  }

  async update(id: string, dto: UpdateNotificationDto): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<Notification> {
    return this.prisma.notification.delete({ where: { id } });
  }

  // Job simples: roda a cada minuto e pega notificações vencidas não enviadas
  @Cron(CronExpression.EVERY_MINUTE)
  async processDueNotifications() {
    const now = new Date();

    const due = await this.prisma.notification.findMany({
      where: {
        sent: false,
        sendAt: { lte: now },
      },
      include: { user: true, task: true },
    });

    if (!due.length) return;

    for (const n of due) {
      // Aqui entra o “disparo real”: push, email, WebSocket, etc.
      this.logger.log(
        `Enviar notificação para usuário ${n.userId}: ${n.title} (task ${n.taskId ?? 'sem task'})`,
      );
    }

    await this.prisma.notification.updateMany({
      where: { id: { in: due.map((n) => n.id) } },
      data: { sent: true },
    });
  }
}