import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from '../../config/prisma.module';
import { AiModule } from '../ai/ai.module'; // Adicione essa importação


@Module({
  imports: [PrismaModule, AiModule], // Adicione AiModule aqui
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}