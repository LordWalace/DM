// src/modules/ai/ai.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria tasks a partir de um texto natural.
   * Formatos aceitos: "às 10 Reunião", "as 14 Almoço", etc.
   */
  async createFromText(text: string, userId: string): Promise<Task[]> {
    // Ex: "às 10 Reunião, às 14 Almoço"
    const regex =
      /(?:às|as)\s+(\d{1,2})\s*(.*?)(?=(?:às|as)\s+\d{1,2}|$)/gi;

    const baseDate = new Date(); // futuramente pode receber data/timezone
    const createPromises: Promise<Task>[] = [];

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const hour = Number(match[1]);
      const title = match[2].trim();

      if (!title || Number.isNaN(hour) || hour < 0 || hour > 23) {
        continue;
      }

      const date = new Date(baseDate);
      date.setHours(hour, 0, 0, 0);

      createPromises.push(
        this.prisma.task.create({
          data: {
            title,
            date,
            userId,
          },
        }),
      );
    }

    if (!createPromises.length) {
      throw new BadRequestException(
        'Nenhuma task válida encontrada no texto.',
      );
    }

    return Promise.all(createPromises);
  }
}