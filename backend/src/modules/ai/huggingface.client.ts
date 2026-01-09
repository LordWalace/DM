import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HuggingFaceClient {
  private readonly apiKey = process.env.HF_API_KEY;
  private readonly baseUrl = 'https://router.huggingface.co/v1';
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('HF_API_KEY não configurado');
      }

      const response = await this.axiosInstance.post('/chat/completions', {
        model: 'meta-llama/Meta-Llama-3-8B-Instruct', // modelo de chat suportado
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente de produtividade e organização de tarefas.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 512,
        temperature: 0.7,
      });

      const text =
        response.data?.choices?.[0]?.message?.content ??
        response.data?.generated_text ??
        '';

      if (!text) {
        throw new Error('Resposta inválida da HuggingFace Router');
      }

      return text.trim();
    } catch (error: any) {
      console.error('❌ Erro ao chamar HuggingFace:', {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
      });
      throw error;
    }
  }

  /**
   * Prompt específico para melhorar texto de tarefas.
   */
  async processTextToTasks(userText: string): Promise<string> {
    const prompt = `Você é um assistente de produtividade.
O usuário escreveu as seguintes atividades ou tarefas (com possíveis erros):
"${userText}"

REGRAS OBRIGATÓRIAS:
- NÃO crie tarefas novas que o usuário não escreveu.
- NÃO invente passos extras (ex.: preparar café se não estiver no texto).
- NÃO duplique tarefas com o mesmo horário.
- A quantidade de tarefas na saída deve ser EXATAMENTE a mesma quantidade de tarefas na entrada.
- Considere que cada tarefa é identificada por um horário ou por estar em uma linha separada.
- Se o usuário escreveu apenas UMA tarefa, a saída deve ter APENAS UMA linha.
- Se o usuário escreveu VÁRIAS tarefas (vários horários ou várias linhas), a saída deve ter o MESMO número de linhas.

Instruções:
1. Melhore o texto, corrigindo erros gramaticais e ortográficos.
2. Se houver múltiplas tarefas separadas por horários (ex.: "às 10h reunião, às 14h almoço"), mantenha cada uma em uma linha separada.
3. Para cada tarefa, crie um título claro e conciso (máximo 10 palavras).
4. Adicione uma breve descrição somente se ficar na MESMA linha da tarefa.
5. Preserve os horários se existirem (aceite formatos como "9h", "09:00", "9:30", "9h30").

Formato esperado de resposta (uma tarefa por linha):
HH:MM título da tarefa
ou
título da tarefa

Responda APENAS com as tarefas melhoradas, sem explicações adicionais.`;

    return await this.generateText(prompt);
  }
}