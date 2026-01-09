// src/modules/google/google.module.ts
import { Module } from '@nestjs/common'
import { GoogleService } from './google.service'
import { GoogleController } from './google.controller'
import { PrismaModule } from '../../config/prisma.module'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Module({
  imports: [PrismaModule],
  providers: [GoogleService],
  controllers: [GoogleController],
  exports: [GoogleService],
})
export class GoogleModule {}
