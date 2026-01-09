// src/modules/users/users.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return { message: 'Usuário criado com sucesso', user };
  }

  // Quem está logado (dados completos do usuário)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    const fullUser = await this.usersService.findById(user.id);
    return fullUser;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return { message: 'Usuário atualizado com sucesso', user };
  }

  // Logout lógico: o backend não guarda sessão, só o token.
  // O front deve apagar o JWT. Aqui podemos, opcionalmente, limpar dados de Google.
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: any) {
    // Opcional: se quiser, pode limpar o googleRefreshToken aqui.
    // await this.usersService.updateGoogleToken(user.id, null); // adaptar método se usar null

    return { message: 'Logout efetuado. Apague o token no cliente.' };
  }

  // Deletar a própria conta (usuário autenticado)
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@CurrentUser() user: any) {
    await this.usersService.deleteAccount(user.id);
    return { message: 'Conta e dados excluídos com sucesso' };
  }
}