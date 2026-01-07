import { IsString, IsNotEmpty, MinLength } from 'class-validator'

export class EnhanceTextDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  text: string
}
