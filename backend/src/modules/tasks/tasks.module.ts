// src/modules/tasks/tasks.module.ts
import { Module, forwardRef } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TasksController } from './tasks.controller'
import { PrismaModule } from '../../config/prisma.module'
import { AiModule } from '../ai/ai.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [PrismaModule, AiModule, forwardRef(() => NotificationsModule)],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}