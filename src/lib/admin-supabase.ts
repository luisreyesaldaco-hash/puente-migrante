import { createClient } from "@supabase/supabase-js";

export function adminSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
}

export async function guardarAnalisis(id: number, campos: {
  resumen?: string;
  es_legal?: boolean;
  concepto_legal?: string | null;
  articulos?: string;
  brief?: string;
}) {
  await adminSupabase().rpc("puente_guardar_analisis", {
    p_id: id,
    p_resumen: campos.resumen ?? null,
    p_es_legal: campos.es_legal ?? null,
    p_concepto_legal: campos.concepto_legal ?? null,
    p_articulos: campos.articulos ?? null,
    p_brief: campos.brief ?? null,
  });
}
