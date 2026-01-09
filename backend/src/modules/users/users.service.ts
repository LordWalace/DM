// src/modules/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { GoogleService } from '../google/google.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleService: GoogleService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        timezone: dto.timezone,
      },
    });
  }

  // ====== NOVOS MÉTODOS PARA LOGIN VIA GOOGLE ======

  async createFromGoogle(input: {
    email: string;
    name?: string;
    googleRefreshToken?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        // usuário criado pelo Google não tem senha local inicialmente
        passwordHash: '',
        name: input.name,
        timezone: null,
        googleRefreshToken: input.googleRefreshToken ?? null,
      },
    });
  }

  async updateGoogleToken(
    userId: string,
    googleRefreshToken: string,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleRefreshToken,
      },
    });
  }

  // =================================================

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    // 1) Revoga token Google se existir
    if (user.googleRefreshToken) {
      await this.googleService.revokeToken(user.googleRefreshToken);
    }

    // 2) Remove dados relacionados (notificações, subscriptions, tasks)
    await this.prisma.notificationSubscription.deleteMany({
      where: { userId },
    });
    await this.prisma.notification.deleteMany({
      where: { userId },
    });
    await this.prisma.task.deleteMany({
      where: { userId },
    });

    // 3) Apaga o próprio usuário
    await this.prisma.user.delete({ where: { id: userId } });
  }
}