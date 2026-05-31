import { checkAdminAuth, unauthorizedResponse } from "@/lib/admin-auth";
import { recuperarContextoLegal } from "@/lib/tesseum-client";

export async function POST(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();

  let body: { concepto_legal?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const concepto = String(body.concepto_legal || "").trim();
  if (!concepto) return Response.json({ error: "Falta concepto_legal" }, { status: 400 });

  const ctx = await recuperarContextoLegal(concepto);
  if (!ctx.ok) return Response.json({ error: ctx.motivo }, { status: 502 });

  return Response.json({ articulos: ctx.contexto });
}
