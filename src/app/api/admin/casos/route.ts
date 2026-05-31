import { createClient } from "@supabase/supabase-js";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/admin-auth";

export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data, error } = await supabase
    .rpc("puente_listar_contactos");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
