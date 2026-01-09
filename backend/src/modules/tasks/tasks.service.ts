// src/modules/tasks/tasks.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Cria uma nova task manualmente
  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const start = new Date(dto.date);
    let endDate: Date | null = dto.endDate ? new Date(dto.endDate) : null;
    let allDay = dto.allDay ?? false;
    let durationMinutes =
      dto.durationMinutes !== undefined ? dto.durationMinutes : null;

    // Se for allDay, ignora fim e duração
    if (allDay) {
      endDate = null;
      durationMinutes = null;
    } else if (!endDate && durationMinutes && durationMinutes > 0) {
      // calcula endDate a partir de date + duração
      const totalMin = start.getHours() * 60 + start.getMinutes() + durationMinutes;
      const fimMin = ((totalMin % (24 * 60)) + 24 * 60) % (24 * 60);
      const hFim = Math.floor(fimMin / 60);
      const mFim = fimMin % 60;
      endDate = new Date(start);
      endDate.setHours(hFim, mFim, 0, 0);
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        date: start,
        endDate,
        allDay,
        durationMinutes,
        done: false,
        userId,
      },
    });

    // Notificação de início (se não for allDay)
    if (!allDay) {
      await this.notificationsService.create(userId, {
        taskId: task.id,
        title: task.title,
        body: dto.description || '',
        sendAt: start.toISOString(),
      });

      // Notificação de fim (se tiver endDate)
      if (endDate) {
        await this.notificationsService.create(userId, {
          taskId: task.id,
          title: `${task.title} - concluída`,
          body: dto.description || '',
          sendAt: endDate.toISOString(),
        });
      }
    }

    return task;
  }

  // Cria múltiplas tarefas a partir de um texto (IA)
  async criarTarefasComIA(userId: string, texto: string): Promise<Task[]> {
    const result = await this.aiService.criarTarefasComIA(texto, userId);
    const tasks = result.tasks as Task[];

    // Para cada task criada pela IA, cria notificações de início/fim
    for (const task of tasks) {
      if (!task.allDay) {
        await this.notificationsService.create(userId, {
          taskId: task.id,
          title: task.title,
          body: task.description || '',
          sendAt: task.date.toISOString(),
        });

        if (task.endDate) {
          await this.notificationsService.create(userId, {
            taskId: task.id,
            title: `${task.title} - concluída`,
            body: task.description || '',
            sendAt: task.endDate.toISOString(),
          });
        }
      }
    }

    return tasks;
  }

  // Retorna todas as tasks de um usuário
  async findAll(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  // Retorna todas as tasks de um usuário específico (alias)
  async findByUser(userId: string): Promise<Task[]> {
    return this.findAll(userId);
  }

  // Atualiza uma task existente (inclusive tempo e allDay)
  async update(taskId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new HttpException('Tarefa não encontrada', HttpStatus.NOT_FOUND);
    }

    let date = dto.date ? new Date(dto.date) : task.date;
    let allDay = dto.allDay ?? task.allDay;
    let durationMinutes =
      dto.durationMinutes !== undefined ? dto.durationMinutes : task.durationMinutes;
    let endDate: Date | null =
      dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : task.endDate;

    if (allDay) {
      endDate = null;
      durationMinutes = null;
    } else {
      if (durationMinutes && durationMinutes > 0) {
        const totalMin = date.getHours() * 60 + date.getMinutes() + durationMinutes;
        const fimMin = ((totalMin % (24 * 60)) + 24 * 60) % (24 * 60);
        const hFim = Math.floor(fimMin / 60);
        const mFim = fimMin % 60;
        endDate = new Date(date);
        endDate.setHours(hFim, mFim, 0, 0);
      } else if (!dto.endDate) {
        // sem duração e sem endDate explícito -> sem fim
        endDate = null;
      }
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title ?? task.title,
        description: dto.description ?? task.description,
        date,
        endDate,
        allDay,
        durationMinutes,
        done: dto.done ?? task.done,
      },
    });

    // Atualizar notificações vinculadas (início e fim)
    if (dto.date || dto.title || dto.description || dto.allDay !== undefined || dto.durationMinutes !== undefined || dto.endDate !== undefined) {
      // Remove notificações antigas da tarefa
      await this.prisma.notification.deleteMany({
        where: { taskId },
      });

      // Recria notificações com os novos horários
      if (!updated.allDay) {
        await this.notificationsService.create(updated.userId, {
          taskId: updated.id,
          title: updated.title,
          body: updated.description || '',
          sendAt: updated.date.toISOString(),
        });

        if (updated.endDate) {
          await this.notificationsService.create(updated.userId, {
            taskId: updated.id,
            title: `${updated.title} - concluída`,
            body: updated.description || '',
            sendAt: updated.endDate.toISOString(),
          });
        }
      }
    }

    return updated;
  }

  // Deleta uma task pelo ID
  async remove(taskId: string): Promise<Task> {
    await this.prisma.notification.deleteMany({
      where: { taskId },
    });

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}