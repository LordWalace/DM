// src/modules/notifications/dto/create-notification.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsDateString()
  sendAt: string; // ISO em UTC

  @IsString()
  @IsOptional()
  taskId?: string;
}
