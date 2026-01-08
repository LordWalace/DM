import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '../../config/prisma.service'
import axios from 'axios'

interface ParsedTask {
  title: string
  date: string
  description?: string
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

@Injectable()
export class AiService {
  private readonly perplexityApiKey = process.env.PERPLEXITY_API_KEY
  private readonly perplexityApiUrl = 'https://api.perplexity.ai/chat/completions'

  constructor(private prisma: PrismaService) {}

  async criarTarefasComIA(texto: string, userId: string) {
    try {
      // Primeiro, melhorar e processar o texto com IA
      const textoMelhorado = await this.processarTextoComIA(texto)
      
      // Depois, extrair as tarefas do texto melhorado
      const tarefas = this.extractTasksFromText(textoMelhorado)

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
            title: this.capitalizarPrimeira(tarefa.title),
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
      const enhancedText = await this.processarTextoComIA(texto)
      return { enhancedText }
    } catch (error) {
      console.error('Erro ao melhorar texto com IA:', error)
      return { enhancedText: texto }
    }
  }

  private async processarTextoComIA(texto: string): Promise<string> {
    try {
      if (!this.perplexityApiKey) {
        console.warn('PERPLEXITY_API_KEY não configurado, usando processamento local')
        return this.simpleEnhanceText(texto)
      }

      const prompt = `Você é um assistente de produtividade. O usuário escreveu as seguintes atividades ou tarefas:

"${texto}"

Por favor:
1. Melhore o texto, corrigindo erros gramaticais e ortográficos
2. Se houver múltiplas tarefas separadas por horários (ex: "às 10h reunião, às 14h almoço"), mantenha cada uma em uma linha separada
3. Para cada tarefa, crie um título claro e conciso (máximo 10 palavras)
4. Adicione uma breve descrição se necessário
5. Preserve os horários se existirem no formato "HH:MM"

Formato esperado de resposta (uma tarefa por linha):
HH:MM título da tarefa
ou
título da tarefa

Responda APENAS com as tarefas melhoradas, sem explicações adicionais.`

      const response = await axios.post<PerplexityResponse>(
        this.perplexityApiUrl,
        {
          model: 'mixtral-8x7b-instruct',
          messages: [
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
            Authorization: `Bearer ${this.perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim()
      }

      return this.simpleEnhanceText(texto)
    } catch (error) {
      console.error('Erro ao chamar API da Perplexity:', error)
      // Fallback para processamento local se a API falhar
      return this.simpleEnhanceText(texto)
    }
  }

  private extractTasksFromText(texto: string): ParsedTask[] {
    const tarefas: ParsedTask[] = []
    const linhas = texto.split('\n').filter(l => l.trim().length > 0)

    for (const linha of linhas) {
      // Padrão para detectar horários: "HH:MM" ou "H:MM"
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
      } else if (linha.trim().length > 0) {
        // Se não tiver horário, adiciona com a data/hora atual
        tarefas.push({
          title: linha.trim(),
          date: new Date().toISOString(),
          description: '',
        })
      }
    }

    return tarefas.length > 0 ? tarefas : []
  }

  private simpleEnhanceText(texto: string): string {
    // Processamento local simples como fallback
    const melhorado = texto
      .trim()
      .split('\n')
      .map(linha => linha.trim())
      .filter(linha => linha.length > 0)
      .map(linha => {
        // Capitalizar primeira letra se não começar com número/horário
        if (!/^\d/.test(linha)) {
          return this.capitalizarPrimeira(linha)
        }
        return linha
      })
      .join('\n')

    return melhorado
  }

  private capitalizarPrimeira(texto: string): string {
    if (!texto || texto.length === 0) return texto
    
    // Se começa com horário (HH:MM), pega a parte após o horário
    const timeMatch = texto.match(/^(\d{1,2}:\d{2})\s+(.+)$/)
    if (timeMatch) {
      const [, horario, resto] = timeMatch
      return `${horario} ${resto.charAt(0).toUpperCase() + resto.slice(1).toLowerCase()}`
    }
    
    // Caso normal: só capitaliza a primeira letra
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
  }
}