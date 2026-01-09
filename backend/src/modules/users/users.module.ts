// src/modules/users/users.module.ts
import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PrismaModule } from '../../config/prisma.module'
import { GoogleModule } from '../google/google.module'

@Module({
  imports: [PrismaModule, GoogleModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}