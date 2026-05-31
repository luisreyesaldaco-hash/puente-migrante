import { createClient } from "@supabase/supabase-js";

function getClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function POST(req: Request) {
  let body: { nombre?: unknown; pais?: unknown; contacto?: unknown; tipo?: unknown; caso?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const nombre = String(body.nombre || "").trim().slice(0, 200);
  const contacto = String(body.contacto || "").trim().slice(0, 300);

  if (!nombre || !contacto) {
    return Response.json({ error: "Nombre y contacto son obligatorios" }, { status: 400 });
  }

  const { error } = await getClient()
    .schema("puente_migrante")
    .from("contact_messages")
    .insert({
      nombre,
      pais: String(body.pais || "").trim().slice(0, 100) || null,
      contacto,
      tipo: String(body.tipo || "").trim().slice(0, 100) || null,
      caso: String(body.caso || "").trim().slice(0, 3000) || null,
    });

  if (error) {
    console.error("contact_messages insert error:", error);
    return Response.json({ error: "No se pudo guardar. Intenta de nuevo." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
