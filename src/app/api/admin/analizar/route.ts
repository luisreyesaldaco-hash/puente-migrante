import { checkAdminAuth, unauthorizedResponse } from "@/lib/admin-auth";
import { guardarAnalisis } from "@/lib/admin-supabase";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const PROMPT_SISTEMA = `Eres un asistente jurídico interno de Puente Migrante.
Recibirás el mensaje original de un usuario y los artículos de ley checa recuperados del corpus.
Tu tarea: redactar un brief interno en español para el orientador, con esta estructura exacta:

**Situación:** (1 frase resumiendo el caso del usuario)

**Lo que SÍ puede hacer:**
- (punto concreto con artículo citado)
- (...)

**Lo que NO puede hacer / riesgos:**
- (punto concreto con artículo citado si aplica)
- (...)

**Artículos clave:** (lista los § relevantes con nombre de la ley)

**Recomendación para el orientador:** (1-2 frases sobre cómo responderle al usuario)

Sé directo y técnico. Esto es para uso interno, no para el usuario final.
Si los artículos recuperados no cubren el caso, indícalo claramente.`;

export async function POST(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();

  let body: { id?: number; caso?: string; articulos?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const caso = String(body.caso || "").trim();
  const articulos = String(body.articulos || "").trim();
  const id = Number(body.id);
  if (!caso || !articulos) return Response.json({ error: "Faltan caso y/o articulos" }, { status: 400 });

  const geminiBody = {
    systemInstruction: { parts: [{ text: PROMPT_SISTEMA }] },
    contents: [{ role: "user", parts: [{ text: `MENSAJE DEL USUARIO:\n${caso}\n\nARTÍCULOS RECUPERADOS DEL CORPUS CHECO:\n${articulos}` }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 1000, thinkingConfig: { thinkingBudget: 0 } },
  };

  try {
    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });
    if (!res.ok) return Response.json({ error: "Error LLM" }, { status: 502 });

    const data = await res.json();
    const brief = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (id) await guardarAnalisis(id, { brief });

    return Response.json({ brief });
  } catch {
    return Response.json({ error: "No se pudo generar el análisis" }, { status: 500 });
  }
}
