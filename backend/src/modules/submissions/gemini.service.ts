import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

export interface CriterionResult {
  criterionId: string;
  criterionName: string;
  level: 'AD' | 'A' | 'B' | 'C';
  reasoning: string;
}

interface Criterion {
  id: string;
  name: string;
  description?: string | null;
  levelDescriptors: { level: string; description: string }[];
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private ai: GoogleGenAI;

  constructor(private config: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.config.get<string>('GEMINI_API_KEY')!,
    });
  }

  async evaluateVideo(
    videoUrl: string,
    rubricName: string,
    criteria: Criterion[],
  ): Promise<CriterionResult[]> {
    // Use short numeric keys to avoid UUID truncation in Gemini responses
    const indexMap = new Map(criteria.map((c, i) => [String(i + 1), c]));

    const rubricText = criteria
      .map((c, i) => {
        const levels = c.levelDescriptors
          .map((ld) => `    - ${ld.level}: ${ld.description}`)
          .join('\n');
        return `Criterio #${i + 1}: "${c.name}"${c.description ? ` (${c.description})` : ''}\n  Niveles:\n${levels}`;
      })
      .join('\n\n');

    const prompt = `Eres un evaluador educativo experto. Analiza el video en la URL proporcionada y evalúa el desempeño según la rúbrica "${rubricName}".

RÚBRICA:
${rubricText}

INSTRUCCIONES:
- Observa detenidamente el video completo.
- Para cada criterio asigna exactamente uno de estos niveles: AD, A, B, o C.
- Justifica brevemente cada nivel asignado (máximo 2 oraciones).
- Responde ÚNICAMENTE con un JSON válido, sin texto adicional, con este formato exacto:

[
  {
    "criterionIndex": "<número del criterio, ej: 1>",
    "level": "<AD|A|B|C>",
    "reasoning": "<justificación>"
  }
]

CRITERIOS A EVALUAR:
${criteria.map((c, i) => `- #${i + 1}: ${c.name}`).join('\n')}

URL DEL VIDEO: ${videoUrl}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = response.text ?? '';
      this.logger.debug(`Gemini raw response: ${text}`);

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in Gemini response');

      const parsed: { criterionIndex: string; level: string; reasoning: string }[] =
        JSON.parse(jsonMatch[0]);

      const validLevels = new Set(['AD', 'A', 'B', 'C']);
      const results: CriterionResult[] = [];

      for (const item of parsed) {
        const criterion = indexMap.get(String(item.criterionIndex));
        if (!criterion)
          throw new Error(`Unknown criterionIndex: ${item.criterionIndex}`);
        if (!validLevels.has(item.level))
          throw new Error(`Invalid level "${item.level}" for criterion #${item.criterionIndex}`);

        results.push({
          criterionId: criterion.id,
          criterionName: criterion.name,
          level: item.level as CriterionResult['level'],
          reasoning: item.reasoning,
        });
      }

      // Ensure every criterion got a result; fill missing with 'A' as fallback
      for (const [idx, criterion] of indexMap.entries()) {
        if (!results.find((r) => r.criterionId === criterion.id)) {
          this.logger.warn(`Criterion #${idx} missing from Gemini response, defaulting to A`);
          results.push({
            criterionId: criterion.id,
            criterionName: criterion.name,
            level: 'A',
            reasoning: 'No evaluado por la IA.',
          });
        }
      }

      return results;
    } catch (error) {
      this.logger.error('Gemini evaluation failed', error);
      throw error;
    }
  }
}
