"use client";

import { useState, useEffect, useCallback } from "react";

type Caso = {
  id: number;
  nombre: string;
  pais: string | null;
  contacto: string;
  tipo: string | null;
  caso: string | null;
  created_at: string;
};

type Analisis = {
  resumen: string;
  es_legal: boolean;
  concepto_legal: string | null;
};

type CasoState = {
  analisis?: Analisis;
  articulos?: string;
  loadingResumen?: boolean;
  loadingLey?: boolean;
  errorResumen?: string;
  errorLey?: string;
  expandLey?: boolean;
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminShell() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [casos, setCasos] = useState<Caso[]>([]);
  const [estados, setEstados] = useState<Record<number, CasoState>>({});
  const [loading, setLoading] = useState(false);

  const fetchCasos = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/casos");
    if (res.status === 401) { setAuthed(false); return; }
    const data = await res.json();
    setCasos(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchCasos();
  }, [authed, fetchCasos]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    document.cookie = `pm_admin=${password}; path=/; SameSite=Lax`;
    fetch("/api/admin/casos").then((r) => {
      if (r.ok) { setAuthed(true); setLoginError(""); }
      else setLoginError("Contraseña incorrecta.");
    });
  }

  async function handleResumit(caso: Caso) {
    setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingResumen: true, errorResumen: undefined } }));
    const res = await fetch("/api/admin/resumir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caso: caso.caso }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingResumen: false, errorResumen: data.error } }));
    } else {
      setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingResumen: false, analisis: data } }));
    }
  }

  async function handleInvestigar(caso: Caso) {
    const concepto = estados[caso.id]?.analisis?.concepto_legal;
    if (!concepto) return;
    setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingLey: true, errorLey: undefined, expandLey: true } }));
    const res = await fetch("/api/admin/investigar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concepto_legal: concepto }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingLey: false, errorLey: data.error } }));
    } else {
      setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingLey: false, articulos: data.articulos } }));
    }
  }

  if (!authed) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <div className="brand" style={{ justifyContent: "center", marginBottom: 24 }}>
            <span className="mark">PM</span> Puente Migrante
          </div>
          <form onSubmit={handleLogin} style={{ display: "grid", gap: 14 }}>
            <div className="field">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {loginError && <p style={{ color: "var(--terra)", fontSize: "0.88rem" }}>{loginError}</p>}
            <button type="submit" className="submit-btn">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <div className="admin-nav">
        <div className="brand"><span className="mark">PM</span> Admin</div>
        <button className="admin-refresh" onClick={fetchCasos} disabled={loading}>
          {loading ? "Cargando..." : "↻ Actualizar"}
        </button>
      </div>

      <div className="admin-inbox wrap">
        <h1 className="admin-title">Casos recibidos <span className="admin-count">{casos.length}</span></h1>

        {casos.length === 0 && !loading && (
          <p style={{ color: "var(--ink-soft)", marginTop: 32 }}>No hay casos aún.</p>
        )}

        {casos.map((c) => {
          const st = estados[c.id] || {};
          const analisis = st.analisis;
          const esLegal = analisis?.es_legal === true;

          return (
            <div key={c.id} className="caso-card">
              <div className="caso-header">
                <div className="caso-meta">
                  <strong>{c.nombre}</strong>
                  {c.pais && <span className="caso-pais">{c.pais}</span>}
                  <span className="caso-fecha">{formatFecha(c.created_at)}</span>
                </div>
                <div className="caso-contacto">{c.contacto}</div>
                {c.tipo && <div className="caso-tipo">{c.tipo}</div>}
              </div>

              {c.caso && <p className="caso-texto">{c.caso}</p>}

              <div className="caso-actions">
                <button
                  className="caso-btn caso-btn-resumir"
                  onClick={() => handleResumit(c)}
                  disabled={st.loadingResumen}
                >
                  {st.loadingResumen ? "Analizando..." : analisis ? "↻ Re-analizar" : "Resumir"}
                </button>

                {esLegal && (
                  <button
                    className="caso-btn caso-btn-ley"
                    onClick={() => handleInvestigar(c)}
                    disabled={st.loadingLey}
                  >
                    {st.loadingLey ? "Consultando..." : st.articulos ? "↻ Ver ley" : "Ver ley →"}
                  </button>
                )}
              </div>

              {analisis && (
                <div className="caso-analisis">
                  <span className={`caso-badge ${esLegal ? "badge-legal" : "badge-no-legal"}`}>
                    {esLegal ? "● Legal" : "○ No legal"}
                  </span>
                  <p className="caso-resumen">{analisis.resumen}</p>
                  {esLegal && analisis.concepto_legal && (
                    <p className="caso-concepto">Concepto: <em>{analisis.concepto_legal}</em></p>
                  )}
                  {st.errorResumen && <p style={{ color: "var(--terra)", fontSize: "0.85rem" }}>{st.errorResumen}</p>}
                </div>
              )}

              {st.expandLey && (
                <div className="caso-ley">
                  {st.loadingLey && <p className="caso-ley-loading">Consultando corpus checo…</p>}
                  {st.errorLey && <p style={{ color: "var(--terra)" }}>{st.errorLey}</p>}
                  {st.articulos && (
                    <>
                      <div className="caso-ley-label">Ley aplicable (Tesseum CZ)</div>
                      <pre className="caso-ley-texto">{st.articulos}</pre>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
