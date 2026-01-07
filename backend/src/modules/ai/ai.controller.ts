import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common'
import { AiService } from './ai.service'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { CreateTaskFromAiDto } from './dto/create-task-from-ai.dto'
import { EnhanceTextDto } from './dto/enhance-text.dto'

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('create')
  async criarTarefasComIA(@Body() createTaskFromAiDto: CreateTaskFromAiDto, @Req() req: any) {
    return this.aiService.criarTarefasComIA(createTaskFromAiDto.text, req.user.id)
  }

  @Post('enhance-text')
  async melhorarTexto(@Body() enhanceTextDto: EnhanceTextDto) {
    return this.aiService.melhorarTexto(enhanceTextDto.text)
  }
}
