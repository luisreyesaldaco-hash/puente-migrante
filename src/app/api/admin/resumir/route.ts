import { checkAdminAuth, unauthorizedResponse } from "@/lib/admin-auth";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const PROMPT_SISTEMA = `Eres un asistente que analiza mensajes de personas en situación migratoria en la República Checa.
Dado el mensaje de un usuario, devuelve ÚNICAMENTE un JSON con esta estructura exacta:
{
  "resumen": "una frase que resume la situación en español neutro",
  "es_legal": true o false,
  "concepto_legal": "concepto jurídico en español para buscar en corpus checo, ej: 'desahucio arrendatario' o 'renovación permiso residencia'"
}

Reglas:
- es_legal = true si el caso implica un derecho, obligación, trámite o norma legal checa (extranjería, laboral, civil, penal, arrendamiento, etc.)
- es_legal = false si es una queja personal, pregunta de servicios, o algo fuera del ámbito jurídico
- concepto_legal solo si es_legal = true, si no ponlo como null
- Responde SOLO el JSON, sin markdown, sin explicaciones`;

export async function POST(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();

  let body: { caso?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const caso = String(body.caso || "").trim();
  if (!caso) return Response.json({ error: "Falta el caso" }, { status: 400 });

  const geminiBody = {
    systemInstruction: { parts: [{ text: PROMPT_SISTEMA }] },
    contents: [{ role: "user", parts: [{ text: caso }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 200,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  try {
    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!res.ok) return Response.json({ error: "Error LLM" }, { status: 502 });

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const parsed = JSON.parse(text.trim());
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "No se pudo analizar el caso" }, { status: 500 });
  }
}
