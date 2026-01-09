// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis disponíveis em todos os módulos
      envFilePath: '.env', 
    }),
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