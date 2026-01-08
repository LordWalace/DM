import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { HuggingFaceClient } from './huggingface.client';
import { PrismaModule } from '../../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, HuggingFaceClient],
  exports: [AiService],
})
export class AiModule {}