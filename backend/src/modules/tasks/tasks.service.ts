// src/modules/tasks/tasks.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  // Cria uma nova task
  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        date: new Date(dto.date),
        userId,
      },
    });
  }

  // Retorna todas as tasks de um usuário
  async findAll(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  // Retorna todas as tasks de um usuário específico
  async findByUser(userId: string): Promise<Task[]> {
    return this.findAll(userId);
  }

  // Atualiza uma task existente
  async update(taskId: string, dto: UpdateTaskDto): Promise<Task> {
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        date: dto.date ? new Date(dto.date) : undefined,
        done: dto.done,
      },
    });
  }

  // Deleta uma task pelo ID
  async remove(taskId: string): Promise<Task> {
    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}