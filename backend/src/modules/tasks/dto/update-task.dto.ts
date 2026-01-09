import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Novo início
  @IsDateString()
  @IsOptional()
  date?: string;

  // Novo fim explícito
  @IsDateString()
  @IsOptional()
  endDate?: string | null;

  // Dia todo
  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  // Nova duração em minutos
  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number | null;

  @IsBoolean()
  @IsOptional()
  done?: boolean;
}