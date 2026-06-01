import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
}

export async function guardarAnalisis(params: {
  id: number;
  resumen?: string;
  es_legal?: boolean;
  concepto_legal?: string | null;
  articulos?: string;
  brief?: string;
}) {
  await db().rpc("puente_actualizar_analisis", {
    p_id:             params.id,
    p_resumen:        params.resumen        ?? null,
    p_es_legal:       params.es_legal       ?? null,
    p_concepto_legal: params.concepto_legal ?? null,
    p_articulos:      params.articulos      ?? null,
    p_brief:          params.brief          ?? null,
  });
}
