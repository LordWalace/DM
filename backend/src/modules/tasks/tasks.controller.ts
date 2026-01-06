// src/modules/tasks/tasks.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.tasksService.create(user.id, dto);
    return { message: 'Task criada com sucesso', task };
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.tasksService.findAll(user.id);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.tasksService.findByUser(userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    const task = await this.tasksService.update(id, dto);
    return { message: 'Task atualizada com sucesso', task };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const task = await this.tasksService.remove(id);
    return { message: 'Task removida com sucesso', task };
  }
}