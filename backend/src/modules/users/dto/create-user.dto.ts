// src/modules/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string; // senha em texto, será hasheada no service

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  timezone?: string; // ex.: "America/Sao_Paulo"
}