// src/modules/tasks/dto/update-task.dto.ts
import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsBoolean()
  @IsOptional()
  done?: boolean;
}
