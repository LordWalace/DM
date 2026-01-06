// src/modules/notifications/notifications.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateNotificationDto,
  ) {
    const notification = await this.notificationsService.create(user.id, dto);
    return { message: 'Notificação criada com sucesso', notification };
  }

  @Get()
  async findForUser(@CurrentUser() user: any) {
    return this.notificationsService.findForUser(user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    const notification = await this.notificationsService.update(id, dto);
    return { message: 'Notificação atualizada com sucesso', notification };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const notification = await this.notificationsService.remove(id);
    return { message: 'Notificação removida com sucesso', notification };
  }
}