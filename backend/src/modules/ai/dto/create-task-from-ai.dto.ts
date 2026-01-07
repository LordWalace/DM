import { IsString, IsNotEmpty, MinLength } from 'class-validator'

export class CreateTaskFromAiDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  text: string
}