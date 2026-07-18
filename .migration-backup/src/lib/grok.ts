// Servicio para integración con Grok 4 (OAuth)

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrokResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GrokService {
  private apiKey: string;
  private baseUrl: string = 'https://api.x.ai/v1';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GROK_OAUTH_TOKEN || '';
    if (!this.apiKey) {
      throw new Error('Grok API key no configurada');
    }
  }

  /**
   * Genera tareas de entrega para un servicio específico
   */
  async generateDeliveryTasks(serviceName: string, serviceDescription: string, deliverables: string[]): Promise<any[]> {
    const systemPrompt = `Eres un experto en gestión de proyectos digitales y agencias de marketing. 
Tu tarea es generar una lista detallada de tareas necesarias para entregar un servicio específico.

Para cada tarea debes proporcionar:
- title: título claro y conciso
- description: descripción detallada de qué implica la tarea
- priority: "low", "medium" o "high"
- estimated_hours: estimación de tiempo en horas
- order: orden secuencial de la tarea (1, 2, 3, etc.)
- dependencies: array de IDs de tareas que deben completarse antes (opcional)

Responde SOLO en formato JSON válido, sin texto adicional.`;

    const userPrompt = `Genera una lista de tareas para entregar el siguiente servicio:

Nombre del servicio: ${serviceName}
Descripción: ${serviceDescription}
Deliverables esperados: ${deliverables.join(', ')}

Genera entre 8-15 tareas específicas y realistas que cubran todo el proceso de entrega,
desde el inicio hasta la entrega final del servicio.`;

    try {
      const response = await this.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      // Parsear la respuesta JSON
      const tasks = JSON.parse(response);
      return tasks;
    } catch (error) {
      console.error('Error generando tareas con Grok:', error);
      throw new Error('No se pudieron generar las tareas automáticamente');
    }
  }

  /**
   * Genera contenido para propuestas
   */
  async generateProposalContent(serviceName: string, clientInfo: { company?: string; industry?: string }): Promise<{
    introduction: string;
    scope: string;
    timeline: string;
    investment: string;
  }> {
    const systemPrompt = `Eres un experto en redacción de propuestas comerciales para agencias digitales.
Genera contenido profesional y persuasivo para propuestas.

Responde SOLO en formato JSON válido con las siguientes claves:
- introduction: párrafo introductorio personalizado
- scope: descripción del alcance del trabajo
- timeline: descripción del timeline estimado
- investment: descripción del valor de la inversión`;

    const userPrompt = `Genera contenido para una propuesta de "${serviceName}" 
para ${clientInfo.company || 'una empresa'} ${clientInfo.industry ? `en el sector ${clientInfo.industry}` : ''}.`;

    try {
      const response = await this.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generando contenido de propuesta:', error);
      throw new Error('No se pudo generar el contenido de la propuesta');
    }
  }

  /**
   * Método genérico para chat completion
   */
  private async chatCompletion(messages: GrokMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }

      const data: GrokResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error en Grok API:', error);
      throw error;
    }
  }
}

// Singleton instance
export const grokService = new GrokService();