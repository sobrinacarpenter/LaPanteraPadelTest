import { GoogleGenAI } from '@google/genai';

export class GeminiService {
  private static ai: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI | null {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY || (window as any).GEMINI_API_KEY;
      if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
      }
    }
    return this.ai;
  }

  static async askPanteraAI(question: string, context?: string): Promise<string> {
    const client = this.getClient();
    if (client) {
      try {
        const response = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Eres el Asistente Táctico y de Gestión de "La Pantera Padel", un prestigioso club de pádel en Bolívar, X6127 Jovita, Córdoba, Argentina (Tel: 03385 43-0525).
          El club cuenta con 1 cancha oficial panorámica de cristal templado 12mm WPT con césped monofilamento azul, iluminación LED 200W, torneos oficiales con todas las categorías y sumas de pádel, clases dirigidas por el Prof. Tomar Villemur, y tercer tiempo con bar.
          
          Responde con tono motivador, ágil, educado y conciso (máximo 3 párrafos cortos).
          Pregunta del jugador: "${question}"
          Contexto adicional: ${context || 'Jugador en Jovita, Córdoba'}`
        });
        return response.text || '¡Gran golpe! En La Pantera Padel te esperamos para disfrutar del mejor pádel de Jovita.';
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent fallback', err);
      }
    }

    // Smart Local Fallback
    const lower = question.toLowerCase();
    if (lower.includes('horario') || lower.includes('turno') || lower.includes('reservar')) {
      return '¡Excelente! En La Pantera Padel contamos con nuestra cancha oficial de cristal WPT. Los horarios más cotizados son entre las 18:30 y 21:30 hs. Si entras y ves tu horario ocupado, toca "Avisarme si se libera" para que el sistema te mande una notificación push al celular en cuanto se cancele.';
    }
    if (lower.includes('profe') || lower.includes('clase') || lower.includes('tomar') || lower.includes('villemur')) {
      return 'El Prof. Tomar Villemur (Tel: 03385 43-0525) dicta clases particulares 1 a 1, parejas y clínicas intensivas de bandeja y víbora. Puedes agendar tu clase directamente desde la sección "Academia" en nuestra web sin necesidad de esperar mensajes de WhatsApp.';
    }
    if (lower.includes('torneo') || lower.includes('premio') || lower.includes('pareja') || lower.includes('suma')) {
      return '¡Organizamos torneos con todas las categorías (1ra a 8va, Damas) y sumas de pareja (Suma 7 a Suma 14)! Puedes revisar los torneos activos y las llaves de eliminación directa con marcadores en vivo en la sección de Torneos.';
    }
    if (lower.includes('cancha') || lower.includes('cristal') || lower.includes('luz')) {
      return 'Nuestra cancha oficial cuenta con cristal templado panorámico WPT de 12mm sin columnas que tapen la visión exterior, césped texturizado azul de bajo impacto articular e iluminación LED 200W antirreflejo.';
    }

    return `¡Hola padelero! En La Pantera Padel (Jovita, Córdoba) tienes la cancha oficial de cristal WPT, torneos en vivo y clases formativas con el Prof. Tomar Villemur. Puedes reservar tu turno con 1 toque en la grilla superior.`;
  }
}
