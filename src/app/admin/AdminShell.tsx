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
  // campos guardados
  resumen: string | null;
  es_legal: boolean | null;
  concepto_legal: string | null;
  articulos: string | null;
  brief: string | null;
};

type CasoState = {
  open: boolean;
  resumen?: string;
  es_legal?: boolean;
  concepto_legal?: string | null;
  articulos?: string;
  brief?: string;
  loadingResumen?: boolean;
  loadingLey?: boolean;
  loadingBrief?: boolean;
  errorResumen?: string;
  errorLey?: string;
  errorBrief?: string;
};

function renderBrief(text: string): React.ReactNode {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**"))
      return <p key={i} className="brief-heading">{line.slice(2, -2)}</p>;
    if (line.startsWith("- "))
      return <p key={i} className="brief-item">• {line.slice(2)}</p>;
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} className="brief-line">{line}</p>;
  });
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function initState(c: Caso): CasoState {
  return {
    open: false,
    resumen:       c.resumen        ?? undefined,
    es_legal:      c.es_legal       ?? undefined,
    concepto_legal: c.concepto_legal ?? undefined,
    articulos:     c.articulos      ?? undefined,
    brief:         c.brief          ?? undefined,
  };
}

export default function AdminShell() {
  const [authed, setAuthed]   = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [casos, setCasos]     = useState<Caso[]>([]);
  const [estados, setEstados] = useState<Record<number, CasoState>>({});
  const [loading, setLoading] = useState(false);

  const fetchCasos = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/casos");
    if (res.status === 401) { setAuthed(false); setLoading(false); return; }
    const data: Caso[] = await res.json();
    setCasos(data);
    setEstados(Object.fromEntries(data.map((c) => [c.id, initState(c)])));
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) fetchCasos(); }, [authed, fetchCasos]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    document.cookie = `pm_admin=${password}; path=/; SameSite=Lax`;
    fetch("/api/admin/casos").then((r) => {
      if (r.ok) { setAuthed(true); setLoginError(""); }
      else setLoginError("Contraseña incorrecta.");
    });
  }

  function toggleOpen(id: number) {
    setEstados((s) => ({ ...s, [id]: { ...s[id], open: !s[id]?.open } }));
  }

  async function handleResumit(caso: Caso) {
    setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingResumen: true, errorResumen: undefined } }));
    const res = await fetch("/api/admin/resumir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: caso.id, caso: caso.caso }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingResumen: false, errorResumen: data.error } }));
    } else {
      setEstados((s) => ({ ...s, [caso.id]: {
        ...s[caso.id], loadingResumen: false,
        resumen: data.resumen, es_legal: data.es_legal, concepto_legal: data.concepto_legal,
      }}));
    }
  }

  async function handleInvestigar(caso: Caso) {
    const concepto = estados[caso.id]?.concepto_legal;
    if (!concepto) return;
    setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingLey: true, errorLey: undefined } }));
    const res = await fetch("/api/admin/investigar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: caso.id, concepto_legal: concepto }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingLey: false, errorLey: data.error } }));
    } else {
      setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingLey: false, articulos: data.articulos } }));
    }
  }

  async function handleAnalizar(caso: Caso) {
    const articulos = estados[caso.id]?.articulos;
    if (!articulos) return;
    setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingBrief: true, errorBrief: undefined } }));
    const res = await fetch("/api/admin/analizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: caso.id, caso: caso.caso, articulos }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingBrief: false, errorBrief: data.error } }));
    } else {
      setEstados((s) => ({ ...s, [caso.id]: { ...s[caso.id], loadingBrief: false, brief: data.brief } }));
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
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoFocus />
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
          const st = estados[c.id] || { open: false };
          const esLegal = st.es_legal === true;
          const analizado = st.resumen !== undefined;

          return (
            <div key={c.id} className={`caso-card ${st.open ? "caso-card--open" : ""}`}>

              {/* HEADER — siempre visible, click para abrir/cerrar */}
              <button className="caso-toggle" onClick={() => toggleOpen(c.id)}>
                <div className="caso-toggle-left">
                  <span className="caso-toggle-arrow">{st.open ? "▾" : "▸"}</span>
                  <span className="caso-toggle-nombre">{c.nombre}</span>
                  {c.pais && <span className="caso-pais">{c.pais}</span>}
                  {analizado && (
                    <span className={`caso-badge ${esLegal ? "badge-legal" : "badge-no-legal"}`}>
                      {esLegal ? "● Legal" : "○ No legal"}
                    </span>
                  )}
                  {st.brief && <span className="caso-badge badge-brief">✓ Brief</span>}
                </div>
                <div className="caso-toggle-right">
                  <span className="caso-contacto-mini">{c.contacto}</span>
                  <span className="caso-fecha">{formatFecha(c.created_at)}</span>
                </div>
              </button>

              {/* BODY — visible solo cuando open */}
              {st.open && (
                <div className="caso-body">
                  {c.tipo && <div className="caso-tipo">{c.tipo}</div>}
                  {c.caso && <p className="caso-texto">{c.caso}</p>}

                  <div className="caso-actions">
                    <button className="caso-btn caso-btn-resumir" onClick={() => handleResumit(c)} disabled={st.loadingResumen}>
                      {st.loadingResumen ? "Analizando..." : analizado ? "↻ Re-analizar" : "Resumir"}
                    </button>
                    {esLegal && (
                      <button className="caso-btn caso-btn-ley" onClick={() => handleInvestigar(c)} disabled={st.loadingLey}>
                        {st.loadingLey ? "Consultando..." : st.articulos ? "↻ Ver ley" : "Ver ley →"}
                      </button>
                    )}
                    {st.articulos && (
                      <button className="caso-btn caso-btn-brief" onClick={() => handleAnalizar(c)} disabled={st.loadingBrief}>
                        {st.loadingBrief ? "Analizando..." : st.brief ? "↻ Brief" : "Analizar →"}
                      </button>
                    )}
                  </div>

                  {analizado && (
                    <div className="caso-analisis">
                      <p className="caso-resumen">{st.resumen}</p>
                      {esLegal && st.concepto_legal && (
                        <p className="caso-concepto">Concepto: <em>{st.concepto_legal}</em></p>
                      )}
                      {st.errorResumen && <p style={{ color: "var(--terra)", fontSize: "0.85rem" }}>{st.errorResumen}</p>}
                    </div>
                  )}

                  {(st.loadingLey || st.articulos || st.errorLey) && (
                    <div className="caso-ley">
                      {st.loadingLey && <p className="caso-ley-loading">Consultando corpus checo…</p>}
                      {st.errorLey && <p style={{ color: "var(--terra)", padding: "12px 14px" }}>{st.errorLey}</p>}
                      {st.articulos && (
                        <>
                          <div className="caso-ley-label">Artículos recuperados (Tesseum CZ)</div>
                          <pre className="caso-ley-texto">{st.articulos}</pre>
                        </>
                      )}
                    </div>
                  )}

                  {(st.loadingBrief || st.brief || st.errorBrief) && (
                    <div className="caso-brief">
                      {st.loadingBrief && <p className="caso-ley-loading">Generando brief…</p>}
                      {st.errorBrief && <p style={{ color: "var(--terra)", padding: "12px 14px" }}>{st.errorBrief}</p>}
                      {st.brief && (
                        <>
                          <div className="caso-brief-label">Brief legal (uso interno)</div>
                          <div className="caso-brief-texto">{renderBrief(st.brief)}</div>
                        </>
                      )}
                    </div>
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
