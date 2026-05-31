import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUENTE_KEY! // key restringida, solo RPC del gate
);

const LIMITE_POR_SESION_DIA = Number(process.env.PUENTE_LIMITE_SESION || 8);
const CAP_GLOBAL_DIA = Number(process.env.PUENTE_CAP_GLOBAL || 500);

export async function consultarGate(
  sessionId: string
): Promise<{ permitido: boolean; motivo?: string }> {
  if (!sessionId) return { permitido: false, motivo: "sesion_invalida" };

  try {
    const { data, error } = await supabase.rpc("puente_gate_consume", {
      p_session: sessionId,
      p_limite_sesion: LIMITE_POR_SESION_DIA,
      p_cap_global: CAP_GLOBAL_DIA,
    });

    if (error) return { permitido: false, motivo: "gate_no_disponible" };
    if (!data?.permitido) return { permitido: false, motivo: data?.motivo || "cuota_agotada" };
    return { permitido: true };
  } catch {
    return { permitido: false, motivo: "gate_no_disponible" };
  }
}
