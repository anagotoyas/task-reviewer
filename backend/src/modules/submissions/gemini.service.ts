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
  private readonly ai: GoogleGenAI;

  constructor(private readonly config: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.config.get<string>('GEMINI_API_KEY')!,
    });
  }

  private async uploadVideoFromUrl(
    videoUrl: string,
  ): Promise<{ fileUri: string; mimeType: string; fileName: string }> {
    this.logger.log(`Downloading video from Supabase...`);

    const response = await fetch(videoUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch video: ${response.statusText}`);

    const contentType = response.headers.get('content-type') ?? 'video/mp4';
    const mimeType = contentType.split(';')[0].trim();
    const buffer = await response.arrayBuffer();
    const blob = new Blob([buffer], { type: mimeType });

    this.logger.log(
      `Uploading ${(blob.size / 1024 / 1024).toFixed(1)} MB to Gemini File API...`,
    );

    const uploaded = await this.ai.files.upload({
      file: blob,
      config: { mimeType, displayName: 'submission-video' },
    });

    if (!uploaded.uri || !uploaded.name)
      throw new Error('Gemini File API did not return URI/name');

    // Poll until ACTIVE (video processing may take several seconds)
    let file = uploaded;
    for (let i = 0; i < 30 && file.state === 'PROCESSING'; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      file = await this.ai.files.get({ name: file.name! });
    }

    if (file.state !== 'ACTIVE') {
      throw new Error(`Gemini file never became active: state=${file.state}`);
    }

    this.logger.log(`File ready: ${file.uri}`);
    return { fileUri: file.uri!, mimeType, fileName: file.name! };
  }

  async evaluateVideo(
    videoUrl: string,
    rubricName: string,
    criteria: Criterion[],
  ): Promise<CriterionResult[]> {
    const { fileUri, mimeType, fileName } =
      await this.uploadVideoFromUrl(videoUrl);

    // Use short numeric keys to avoid UUID truncation in Gemini responses
    const indexMap = new Map(criteria.map((c, i) => [String(i + 1), c]));

    const rubricText = criteria
      .map((c, i) => {
        const levels = c.levelDescriptors
          .map((ld) => `    - ${ld.level}: ${ld.description}`)
          .join('\n');
        const optionalDesc = c.description ? ` (${c.description})` : '';
        return `Criterio #${i + 1}: "${c.name}"${optionalDesc}\n  Niveles:\n${levels}`;
      })
      .join('\n\n');

    const prompt = `Actúa como un evaluador académico objetivo y transparente. Califica la siguiente tarea analizando el proceso de razonamiento del estudiante, no solo el resultado final. Justifica tu evaluación evitando sesgos y proporciona una retroalimentación detallada pero concisa y orientada a la acción: señala las fortalezas, identifica los errores específicos explicando por qué ocurren, y recomienda recursos o pasos concretos para mejorar.

Analiza el video adjunto y evalúa el desempeño según la rúbrica "${rubricName}".

RÚBRICA:
${rubricText}

INSTRUCCIONES:
- Observa detenidamente el video completo.
- Para cada criterio asigna exactamente uno de estos niveles: AD, A, B, o C.
- Si el nivel asignado NO es AD (máximo), proporciona retroalimentación detallada pero concisa: fortalezas observadas, errores específicos con su causa, y pasos concretos o recursos para mejorar.
- Si el nivel asignado ES AD, una justificación breve es suficiente.
- Responde ÚNICAMENTE con un JSON válido, sin texto adicional, con este formato exacto:

[
  {
    "criterionIndex": "<número del criterio, ej: 1>",
    "level": "<AD|A|B|C>",
    "reasoning": "<justificación detallada pero concisa, especialmente si el nivel NO es AD>"
  }
]

CRITERIOS A EVALUAR:
${criteria.map((c, i) => `- #${i + 1}: ${c.name}`).join('\n')}`;


    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ fileData: { mimeType, fileUri } }, { text: prompt }],
          },
        ],
      });

      const text = response.text ?? '';
      this.logger.debug(`Gemini raw response: ${text}`);

      const jsonMatch = text.match(/\[[^]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in Gemini response');

      const parsed: {
        criterionIndex: string;
        level: string;
        reasoning: string;
      }[] = JSON.parse(jsonMatch[0]);

      const validLevels = new Set(['AD', 'A', 'B', 'C']);
      const results: CriterionResult[] = [];

      for (const item of parsed) {
        const criterion = indexMap.get(String(item.criterionIndex));
        if (!criterion)
          throw new Error(`Unknown criterionIndex: ${item.criterionIndex}`);
        if (!validLevels.has(item.level))
          throw new Error(
            `Invalid level "${item.level}" for criterion #${item.criterionIndex}`,
          );

        results.push({
          criterionId: criterion.id,
          criterionName: criterion.name,
          level: item.level as CriterionResult['level'],
          reasoning: item.reasoning,
        });
      }

      // Fill any missing criteria with fallback
      for (const [idx, criterion] of indexMap.entries()) {
        if (!results.find((r) => r.criterionId === criterion.id)) {
          this.logger.warn(
            `Criterion #${idx} missing from Gemini response, defaulting to A`,
          );
          results.push({
            criterionId: criterion.id,
            criterionName: criterion.name,
            level: 'A',
            reasoning: 'No evaluado por la IA.',
          });
        }
      }

      return results;
    } finally {
      // Always clean up the uploaded file from Gemini (48h TTL anyway, but good hygiene)
      this.ai.files
        .delete({ name: fileName })
        .catch((e) =>
          this.logger.warn(
            `Could not delete Gemini file ${fileName}: ${e.message}`,
          ),
        );
    }
  }
}
