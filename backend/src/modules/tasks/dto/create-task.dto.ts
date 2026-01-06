// src/modules/tasks/dto/create-task.dto.ts
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // ISO string
}
