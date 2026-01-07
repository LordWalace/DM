import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreateTaskDto } from '../tasks/dto/create-task.dto'
import axios } from 'axios'

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
      // Parse do texto usando IA (Perplexity ou OpenAI)
      const tarefas = await this.parseTextToTasks(texto)

      if (!tarefas || tarefas.length === 0) {
        throw new HttpException(
          'Não foi possível extrair tarefas do texto',
          HttpStatus.BAD_REQUEST,
        )
      }

      // Criar tarefas no banco de dados
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
      // Chamar Perplexity AI ou OpenAI para melhorar o texto
      const enhancedText = await this.callPerplexityAPI(texto)
      return { enhancedText }
    } catch (error) {
      console.error('Erro ao melhorar texto com IA:', error)
      // Retornar o texto original se a IA falhar
      return { enhancedText: texto }
    }
  }

  private async parseTextToTasks(texto: string): Promise<ParsedTask[]> {
    try {
      const response = await this.callPerplexityAPI(
        `Por favor, analise o seguinte texto e extraia tarefas/eventos com horários. 
        Retorne um JSON com array de objetos contendo: title, date (em ISO 8601), e description opcional.
        Texto: "${texto}"
        
        Responda APENAS com o JSON válido, sem explicações adicionais.`,
      )

      // Tentar parsear o JSON da resposta
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const tarefas = JSON.parse(jsonMatch[0])
        return tarefas.map((t: any) => ({
          title: t.title || t.titulo || 'Sem título',
          date: t.date || t.data || new Date().toISOString(),
          description: t.description || t.descricao || '',
        }))
      }

      // Fallback: tentar extrair manualmente
      return this.extractTasksFromText(texto)
    } catch (error) {
      console.error('Erro ao fazer parse do texto:', error)
      return this.extractTasksFromText(texto)
    }
  }

  private async callPerplexityAPI(prompt: string): Promise<string> {
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY
      if (!apiKey) {
        console.warn('PERPLEXITY_API_KEY não configurada')
        return prompt // Retornar prompt original se chave não estiver configurada
      }

      const response = await axios.post(
        'https://api.perplexity.ai/openai/deployments/llama-2-7b-chat/chat/completions',
        {
          model: 'llama-2-7b-chat',
          messages: [
            {
              role: 'system',
              content:
                'Você é um assistente que ajuda a melhorar e organizar texto em tarefas. Seja conciso e útil.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      )

      return response.data.choices[0]?.message?.content || prompt
    } catch (error) {
      console.error('Erro ao chamar Perplexity API:', error)
      return prompt
    }
  }

  private extractTasksFromText(texto: string): ParsedTask[] {
    const tarefas: ParsedTask[] = []
    const linhas = texto.split('\n').filter(l => l.trim())

    for (const linha of linhas) {
      // Padrão: "HH:mm Descrição da tarefa"
      const match = linha.match(/^(\d{1,2}):(\d{2})\s+(.+)$/)
      if (match) {
        const [, horas, minutos, titulo] = match
        const agora = new Date()
        const data = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
        data.setHours(parseInt(horas), parseInt(minutos), 0)

        tarefas.push({
          title: titulo.trim(),
          date: data.toISOString(),
        })
      }
    }

    return tarefas.length > 0 ? tarefas : [{ title: texto, date: new Date().toISOString() }]
  }
}