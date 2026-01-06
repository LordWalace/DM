// src/modules/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaModule } from '../../config/prisma.module';

@Module({
  imports: [PrismaModule], // Importa o PrismaModule para acesso ao banco
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService], // Permite que outros módulos usem o AiService
})
export class AiModule {}