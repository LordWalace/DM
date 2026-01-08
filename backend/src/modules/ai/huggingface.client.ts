import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HuggingFaceClient {
  private readonly apiKey = process.env.HF_API_TOKEN;
  private readonly apiUrl = 'https://api-inference.huggingface.co/models/google/flan-t5-large';
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
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
        throw new Error('HF_API_TOKEN não configurado');
      }

      const response = await this.axiosInstance.post(this.apiUrl, {
        inputs: prompt,
        parameters: {
          max_length: 2000,
          temperature: 0.7,
        },
      });

      // A resposta da HuggingFace é um array com objetos contendo 'generated_text'
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0].generated_text || '';
      }

      if (response.data?.generated_text) {
        return response.data.generated_text;
      }

      throw new Error('Resposta inválida da HuggingFace');
    } catch (error: any) {
      console.error('❌ Erro ao chamar HuggingFace:', {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
      });
      throw error;
    }
  }

  async processTextToTasks(userText: string): Promise<string> {
    const prompt = `Você é um assistente de organização de tarefas. O usuário descreve suas atividades em linguagem natural.

Converta este texto em tarefas estruturadas no formato JSON com título e horário (ISO 8601):
"${userText}"

Retorne APENAS um JSON válido com o seguinte formato:
{
  "tasks": [
    {
      "title": "Título da tarefa",
      "date": "2025-01-07T10:00:00Z",
      "description": "Breve descrição opcional"
    }
  ]
}

Se não houver horário especificado, use a data de hoje com hora 09:00:00.
Importante: Retorne APENAS o JSON, sem explicações adicionais.`;

    return await this.generateText(prompt);
  }
}