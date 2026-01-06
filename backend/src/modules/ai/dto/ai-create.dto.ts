// src/modules/ai/dto/ai-create.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class AiCreateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  text: string;
}
