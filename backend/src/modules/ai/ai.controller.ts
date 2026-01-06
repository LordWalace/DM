// src/modules/ai/ai.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiCreateDto } from './dto/ai-create.dto';
import { Task } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('create')
  async create(
    @CurrentUser() user: any,
    @Body() dto: AiCreateDto,
  ): Promise<{ message: string; tasks: Task[] }> {
    const tasks = await this.service.createFromText(dto.text, user.id);
    return { message: 'Tasks criadas com sucesso', tasks };
  }
}