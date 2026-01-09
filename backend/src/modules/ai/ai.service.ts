import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { HuggingFaceClient } from './huggingface.client';

interface ParsedTask {
  title: string;
  date: string;
  description?: string;
}

interface InfoTempoTarefa {
  tipo: 'horario' | 'turno' | 'dia_todo';
  horaInicio?: string; // HH:MM
  duracaoMinutos?: number; // em minutos
  allDay: boolean;
}

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private huggingfaceClient: HuggingFaceClient,
  ) {}

  // PÚBLICOS
  
  async criarTarefasComIA(texto: string, userId: string) {
    try {
      // 1) Processar texto com IA
      const textoProcessado = await this.processarTextoComIA(texto);

      // 2) Extrair tarefas
      const tarefas = this.extractTasksFromText(textoProcessado, texto);

      if (!tarefas || tarefas.length === 0) {
        throw new HttpException(
          'Não foi possível extrair tarefas do texto',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3) Inferir regras de tempo (hora, turno, duração)
      const infoTempoGlobal = this.inferirTempo(texto);

      // 4) Criar no banco
      const tarefasAdicionadas: any[] = [];
      for (const tarefa of tarefas) {
        const start = new Date(tarefa.date);
        let end: Date | null = null;
        let allDay = false;
        let durationMinutes: number | null = null;

        if (infoTempoGlobal.allDay) {
          allDay = true;
        } else if (infoTempoGlobal.horaInicio) {
          // se houver duração, calcula fim
          if (infoTempoGlobal.duracaoMinutos) {
            durationMinutes = infoTempoGlobal.duracaoMinutos;
            const horaFimStr = this.somarDuracao(
              infoTempoGlobal.horaInicio,
              infoTempoGlobal.duracaoMinutos,
            );
            const [hFim, mFim] = horaFimStr.split(':').map(Number);
            end = new Date(start);
            end.setHours(hFim, mFim, 0, 0);
          }
        }

        const task = await this.prisma.task.create({
          data: {
            title: this.capitalizarPrimeira(tarefa.title),
            description: tarefa.description || '',
            date: start,          // início
            endDate: end,         // fim (se houver)
            allDay,               // dia todo
            durationMinutes,      // duração em minutos
            done: false,
            userId,
          },
        });
        tarefasAdicionadas.push(task);
      }

      return { tasks: tarefasAdicionadas };
    } catch (error) {
      console.error('Erro ao criar tarefas com IA:', error);
      throw new HttpException(
        'Erro ao processar tarefas com IA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async melhorarTexto(texto: string): Promise<{ enhancedText: string }> {
    try {
      const enhancedText = await this.processarTextoComIA(texto);
      return { enhancedText };
    } catch (error) {
      console.error('Erro ao melhorar texto com IA:', error);
      return { enhancedText: texto };
    }
  }

  // FLUXO IA

  private async processarTextoComIA(texto: string): Promise<string> {
    try {
      const response = await this.huggingfaceClient.processTextToTasks(texto);
      return response.trim();
    } catch (error: any) {
      console.error('❌ Erro ao processar texto com HuggingFace:', error);
      return this.simpleEnhanceText(texto);
    }
  }

  /**
   * Usa o texto da IA + texto original para montar ParsedTask com data/hora.
   */
  private extractTasksFromText(
    textoIA: string,
    textoOriginalUsuario: string,
  ): ParsedTask[] {
    const tarefas: ParsedTask[] = [];
    const linhasIA = textoIA.split('\n').filter((l) => l.trim().length > 0);

    // limitar para não criar mais tarefas do que o usuário escreveu
    const linhasUsuario = textoOriginalUsuario
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const qtdEsperada = linhasUsuario.length || 1;
    const linhasLimitadas = linhasIA.slice(0, qtdEsperada);

    const infoTempoGlobal = this.inferirTempo(textoOriginalUsuario);
    const agora = new Date();

    for (const linha of linhasLimitadas) {
      const timePattern = /^(\d{1,2}):(\d{2})\s+(.+)$/;
      const match = linha.match(timePattern);

      let data = new Date(
        agora.getFullYear(),
        agora.getMonth(),
        agora.getDate(),
      );
      let titulo = linha.trim();

      if (match) {
        const [, horas, minutos, tituloIA] = match;
        data.setHours(parseInt(horas), parseInt(minutos), 0, 0);
        titulo = tituloIA.trim();
      } else {
        // Sem horário na linha da IA -> usar regras de turno/dia-todo
        if (infoTempoGlobal.allDay) {
          data.setHours(0, 0, 0, 0); // dia todo, hora zerada
        } else if (infoTempoGlobal.horaInicio) {
          const [h, m] = infoTempoGlobal.horaInicio.split(':').map(Number);
          data.setHours(h, m, 0, 0);
        }
      }

      tarefas.push({
        title: titulo,
        date: data.toISOString(),
        description: '',
      });
    }

    return tarefas.length > 0 ? tarefas : [];
  }

  // HELPERS DE TEMPO

  // extrai duração em minutos, ex.: "por 2 horas" -> 120
  private parseDuracaoHoras(texto: string): number | null {
    const t = texto.toLowerCase();

    // "por 2 horas", "2 horas", "2h"
    const regexNum = /(?:por\s+)?(\d+)\s*(h|hora|horas)\b/;
    const match = t.match(regexNum);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0) {
        return num * 60; // minutos
      }
    }

    return null;
  }

  // soma duração a um horário HH:MM e devolve HH:MM do fim
  private somarDuracao(horaInicio: string, duracaoMinutos: number): string {
    const [hh, mm] = horaInicio.split(':').map(Number);
    const totalMin = hh * 60 + mm + duracaoMinutos;
    const fimMin = ((totalMin % (24 * 60)) + (24 * 60)) % (24 * 60);
    const h = Math.floor(fimMin / 60);
    const m = fimMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /**
   * Inferir horário/turno/dia-todo + duração a partir do texto do usuário.
   */
  private inferirTempo(userText: string): InfoTempoTarefa {
    const texto = userText.toLowerCase();

    const TURNO_MANHA = '08:00';
    const TURNO_TARDE = '14:00';
    const TURNO_NOITE = '19:00';

    const duracaoMinutos = this.parseDuracaoHoras(texto) || undefined;

    // 1) Hora explícita (9, 9h, 09:00, 9:30, 9h30, etc.)
    const regexHora = /\b(\d{1,2})(?::(\d{2}))?\s*(h|horas?)?\b/;
    const match = texto.match(regexHora);

    if (match) {
      const hNum = parseInt(match[1], 10);
      const mNum = match[2] ? parseInt(match[2], 10) : 0;

      const h = String(hNum).padStart(2, '0');
      const m = String(mNum).padStart(2, '0');

      return {
        tipo: 'horario',
        horaInicio: `${h}:${m}`,
        duracaoMinutos,
        allDay: !duracaoMinutos,
      };
    }

    // 2) Sem hora explícita: procurar turno
    if (texto.includes('manhã') || texto.includes('manha')) {
      return {
        tipo: 'turno',
        horaInicio: TURNO_MANHA,
        duracaoMinutos,
        allDay: !duracaoMinutos,
      };
    }

    if (texto.includes('tarde')) {
      return {
        tipo: 'turno',
        horaInicio: TURNO_TARDE,
        duracaoMinutos,
        allDay: !duracaoMinutos,
      };
    }

    if (texto.includes('noite')) {
      return {
        tipo: 'turno',
        horaInicio: TURNO_NOITE,
        duracaoMinutos,
        allDay: !duracaoMinutos,
      };
    }

    // 3) Nenhuma hora nem turno -> dia todo
    return {
      tipo: 'dia_todo',
      allDay: true,
    };
  }

  // OUTROS HELPERS

  private simpleEnhanceText(texto: string): string {
    const melhorado = texto
      .trim()
      .split('\n')
      .map((linha) => linha.trim())
      .filter((linha) => linha.length > 0)
      .map((linha) => {
        if (!/^\d/.test(linha)) {
          return this.capitalizarPrimeira(linha);
        }
        return linha;
      })
      .join('\n');

    return melhorado;
  }

  private capitalizarPrimeira(texto: string): string {
    if (!texto || texto.length === 0) return texto;

    const timeMatch = texto.match(/^(\d{1,2}:\d{2})\s+(.+)$/);
    if (timeMatch) {
      const [, horario, resto] = timeMatch;
      return `${horario} ${
        resto.charAt(0).toUpperCase() + resto.slice(1).toLowerCase()
      }`;
    }

    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }
}