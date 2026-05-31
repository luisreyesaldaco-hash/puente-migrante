const TESSEUM_MCP_URL = process.env.TESSEUM_MCP_URL || "https://www.tesseum.com/api/mcp";
const TESSEUM_MCP_KEY = process.env.TESSEUM_MCP_KEY;

const PAIS = "CZ";

async function callTesseumTool(toolName: string, args: Record<string, unknown>): Promise<string> {
  if (!TESSEUM_MCP_KEY) throw new Error("Falta TESSEUM_MCP_KEY en el entorno.");

  const body = {
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: { name: toolName, arguments: args },
  };

  const res = await fetch(TESSEUM_MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      Authorization: `Bearer ${TESSEUM_MCP_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = Object.assign(new Error(`Tesseum MCP ${res.status}: ${text}`), { status: res.status });
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  let payload: { error?: unknown; result?: { content?: { type: string; text: string }[]; isError?: boolean } };
  if (contentType.includes("text/event-stream")) {
    payload = parseSSE(await res.text());
  } else {
    payload = await res.json();
  }

  if (payload.error) throw new Error(`Tesseum MCP error: ${JSON.stringify(payload.error)}`);

  const content = payload.result?.content || [];
  if (payload.result?.isError) throw new Error(content.map((b) => b.text).join(" "));
  return content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

function parseSSE(raw: string): { error?: unknown; result?: { content?: { type: string; text: string }[] } } {
  const lines = raw.split("\n").filter((l) => l.startsWith("data:"));
  if (!lines.length) return {};
  const last = lines[lines.length - 1].slice(5).trim();
  try { return JSON.parse(last); } catch { return {}; }
}

export async function recuperarContextoLegal(consulta: string): Promise<
  { ok: true; contexto: string } | { ok: false; motivo: string; detalle?: string }
> {
  try {
    const resultado = await callTesseumTool("buscar_articulos_semantico", {
      pais: PAIS,
      concepto: consulta,
      match_count: 5,
    });
    return { ok: true, contexto: resultado };
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 402) return { ok: false, motivo: "cuota_agotada" };
    return { ok: false, motivo: "error_corpus", detalle: e.message };
  }
}
