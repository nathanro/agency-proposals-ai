import { Router } from "express";
import OpenAI from "openai";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

// POST /api/ai/generate-proposal
router.post("/ai/generate-proposal", async (req, res) => {
  const { serviceName, clientName, clientCompany, serviceDescription } = req.body;
  if (!serviceName || !clientName) {
    res.status(400).json({ error: "serviceName and clientName are required" });
    return;
  }
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      max_completion_tokens: 1500,
      messages: [
        {
          role: "system",
          content: "Eres un experto en propuestas de agencias de marketing digital. Generas propuestas profesionales, persuasivas y en español. Responde SIEMPRE con JSON válido.",
        },
        {
          role: "user",
          content: `Genera contenido para una propuesta de servicio.
Servicio: ${serviceName}
${serviceDescription ? `Descripción: ${serviceDescription}` : ""}
Cliente: ${clientName}
${clientCompany ? `Empresa: ${clientCompany}` : ""}

Responde con este JSON exacto:
{
  "introduction": "párrafo introductorio personalizado (2-3 oraciones)",
  "scope": "descripción del alcance del trabajo (2-3 oraciones)",
  "timeline": "descripción del timeline del proyecto (1-2 oraciones)",
  "investment": "mensaje sobre el valor de la inversión (1-2 oraciones)"
}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : raw);
    res.json(parsed);
  } catch (err) {
    console.error("AI generate-proposal error:", err);
    res.status(500).json({ error: "Error generando contenido" });
  }
});

// POST /api/ai/generate-tasks
router.post("/ai/generate-tasks", async (req, res) => {
  const { serviceName, serviceDescription, deliverables } = req.body;
  if (!serviceName) {
    res.status(400).json({ error: "serviceName is required" });
    return;
  }
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      max_completion_tokens: 1500,
      messages: [
        {
          role: "system",
          content: "Eres un project manager experto en agencias digitales. Generas listas de tareas detalladas en español. Responde SIEMPRE con JSON válido.",
        },
        {
          role: "user",
          content: `Genera una lista de tareas de entrega para este servicio.
Servicio: ${serviceName}
${serviceDescription ? `Descripción: ${serviceDescription}` : ""}
${deliverables?.length ? `Deliverables: ${deliverables.join(", ")}` : ""}

Responde con este JSON exacto (array de 5-8 tareas):
[
  {
    "title": "Nombre de la tarea",
    "description": "Descripción breve de la tarea",
    "priority": "high|medium|low",
    "estimatedHours": 4
  }
]`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match ? match[0] : raw);
    res.json(parsed);
  } catch (err) {
    console.error("AI generate-tasks error:", err);
    res.status(500).json({ error: "Error generando tareas" });
  }
});

export default router;
