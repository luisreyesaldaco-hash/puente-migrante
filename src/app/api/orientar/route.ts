import { consultarGate } from "@/lib/gate";
import { recuperarContextoLegal } from "@/lib/tesseum-client";
import { PUENTE_SYSTEM_PROMPT, PUENTE_UI_DISCLAIMER } from "@/lib/system-prompt";

export const runtime = "edge";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent";

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  let body: { consulta?: unknown; sessionId?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Cuerpo inválido" }, 400);
  }

  const consulta = String(body.consulta || "").trim();
  const sessionId = String(body.sessionId || "").trim();

  if (!consulta) return json({ error: "Falta la consulta" }, 400);
  if (consulta.length > 1500) return json({ error: "La consulta es demasiado larga" }, 400);

  const gate = await consultarGate(sessionId);
  if (!gate.permitido) {
    const mensaje =
      gate.motivo === "limite_sesion"
        ? "Has alcanzado el número de consultas gratuitas de hoy. Para seguir, agenda una consulta personal y con gusto revisamos tu caso a fondo."
        : "El servicio de orientación está con mucha demanda en este momento. Mientras tanto, puedes dejarnos tu caso por el formulario y te respondemos personalmente.";
    return json({ tipo: "limite", mensaje, disclaimer: PUENTE_UI_DISCLAIMER }, 200);
  }

  const ctx = await recuperarContextoLegal(consulta);
  if (!ctx.ok) {
    const mensaje =
      ctx.motivo === "cuota_agotada"
        ? "Estamos al tope de consultas al sistema legal hoy. Déjanos tu caso por el formulario y te respondemos personalmente."
        : "No pude consultar la base legal en este momento. Por favor intenta de nuevo en unos minutos, o déjanos tu caso por el formulario.";
    return json({ tipo: "sin_contexto", mensaje, disclaimer: PUENTE_UI_DISCLAIMER }, 200);
  }

  const userTurn = [
    `CONSULTA DE LA PERSONA:\n${consulta}`,
    ``,
    `CONTEXTO LEGAL RECUPERADO DEL CORPUS (única fuente permitida para afirmar lo que dice la ley):`,
    ctx.contexto || "(sin resultados)",
    ``,
    `Responde siguiendo el contrato de salida: informa sobre la ley en abstracto, cita el artículo, no dictamines el caso, y cierra derivando a consulta personal.`,
  ].join("\n");

  const geminiBody = {
    systemInstruction: { parts: [{ text: PUENTE_SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: userTurn }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1200 },
    thinkingConfig: { thinkingBudget: 0 },
  };

  let upstream: Response;
  try {
    upstream = await fetch(`${GEMINI_URL}?alt=sse&key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });
  } catch {
    return json(
      { tipo: "error", mensaje: "No pude generar la orientación. Intenta de nuevo.", disclaimer: PUENTE_UI_DISCLAIMER },
      200
    );
  }

  if (!upstream.ok || !upstream.body) {
    return json(
      { tipo: "error", mensaje: "No pude generar la orientación. Intenta de nuevo.", disclaimer: PUENTE_UI_DISCLAIMER },
      200
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              /* fragmento parcial */
            }
          }
        }
        controller.enqueue(encoder.encode(`\n\n— ${PUENTE_UI_DISCLAIMER}`));
      } catch {
        controller.enqueue(encoder.encode("\n\n(Se interrumpió la respuesta. Intenta de nuevo.)"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
