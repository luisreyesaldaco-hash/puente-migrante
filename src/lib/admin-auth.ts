export function checkAdminAuth(req: Request): boolean {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)pm_admin=([^;]+)/);
  if (!match) return false;
  return match[1] === process.env.ADMIN_PASSWORD;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "No autorizado" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
