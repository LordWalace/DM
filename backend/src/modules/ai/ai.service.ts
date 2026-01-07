import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '../../config/prisma.service'

interface ParsedTask {
  title: string
  date: string
  description?: string
}

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async criarTarefasComIA(texto: string, userId: string) {
    try {
      const tarefas = this.extractTasksFromText(texto)

      if (!tarefas || tarefas.length === 0) {
        throw new HttpException(
          'Não foi possível extrair tarefas do texto',
          HttpStatus.BAD_REQUEST,
        )
      }

      const tarefasAdicionadas: any[] = []
      for (const tarefa of tarefas) {
        const task = await this.prisma.task.create({
          data: {
            title: tarefa.title,
            description: tarefa.description || '',
            date: new Date(tarefa.date),
            done: false,
            userId: userId,
          },
        })
        tarefasAdicionadas.push(task)
      }

      return { tasks: tarefasAdicionadas }
    } catch (error) {
      console.error('Erro ao criar tarefas com IA:', error)
      throw new HttpException(
        'Erro ao processar tarefas com IA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async melhorarTexto(texto: string): Promise<{ enhancedText: string }> {
    try {
      const enhancedText = this.simpleEnhanceText(texto)
      return { enhancedText }
    } catch (error) {
      console.error('Erro ao melhorar texto com IA:', error)
      return { enhancedText: texto }
    }
  }

  private extractTasksFromText(texto: string): ParsedTask[] {
    const tarefas: ParsedTask[] = []
    const linhas = texto.split('\n').filter(l => l.trim())

    for (const linha of linhas) {
      const timePattern = /^(\d{1,2}):(\d{2})\s+(.+)$/
      const match = linha.match(timePattern)

      if (match) {
        const [, horas, minutos, titulo] = match
        const agora = new Date()
        const data = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
        data.setHours(parseInt(horas), parseInt(minutos), 0)

        tarefas.push({
          title: titulo.trim(),
          date: data.toISOString(),
          description: '',
        })
      } else {
        tarefas.push({
          title: linha.trim(),
          date: new Date().toISOString(),
          description: '',
        })
      }
    }

    return tarefas.length > 0 ? tarefas : [{ title: texto, date: new Date().toISOString() }]
  }

  private simpleEnhanceText(texto: string): string {
    return texto
      .trim()
      .split('.')
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .join('. ')
      .concat('.')
  }
}