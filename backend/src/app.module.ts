// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './config/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GoogleModule } from './modules/google/google.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    UsersModule,
    GoogleModule,
    AuthModule,
    TasksModule,
    AiModule,
    NotificationsModule,
  ],
})
export class AppModule {}