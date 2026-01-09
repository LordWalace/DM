import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Início da tarefa (obrigatório)
  @IsDateString()
  @IsNotEmpty()
  date: string; // ISO string

  // Tarefa de dia todo (se true, ignora endDate/durationMinutes)
  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  // Horário de término explícito (opcional)
  @IsDateString()
  @IsOptional()
  endDate?: string;

  // Duração em minutos (opcional, ex.: 120 = 2h)
  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;
}