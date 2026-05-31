"use client";

import { useState, useRef, useEffect, useCallback } from "react";

function getOrCreateSessionId(): string {
  const KEY = "pm_sid";
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)pm_sid=([^;]+)/);
  if (match) return match[1];
  const id = crypto.randomUUID();
  document.cookie = `${KEY}=${id}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
  return id;
}

type ChatState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "streaming"; text: string }
  | { phase: "done"; text: string }
  | { phase: "limite"; mensaje: string }
  | { phase: "error"; mensaje: string };

export default function MiniChat() {
  const [consulta, setConsulta] = useState("");
  const [state, setState] = useState<ChatState>({ phase: "idle" });
  const responseRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if ((state.phase === "streaming" || state.phase === "done") && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [state]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const q = consulta.trim();
    if (!q || state.phase === "loading" || state.phase === "streaming") return;

    setState({ phase: "loading" });
    const sessionId = getOrCreateSessionId();

    try {
      const res = await fetch("/api/orientar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consulta: q, sessionId }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.tipo === "limite") {
          setState({ phase: "limite", mensaje: data.mensaje });
        } else {
          setState({ phase: "error", mensaje: data.mensaje || "Error inesperado. Intenta de nuevo." });
        }
        return;
      }

      if (!res.body) {
        setState({ phase: "error", mensaje: "No pude conectarme. Intenta de nuevo." });
        return;
      }

      setState({ phase: "streaming", text: "" });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setState({ phase: "streaming", text: accumulated });
      }

      setState({ phase: "done", text: accumulated });
    } catch {
      setState({ phase: "error", mensaje: "Error de red. Revisa tu conexión e intenta de nuevo." });
    }
  }, [consulta, state.phase]);

  const handleReset = () => {
    setState({ phase: "idle" });
    setConsulta("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const isAnswering = state.phase === "streaming" || state.phase === "done";
  const showFallback = state.phase === "limite" || state.phase === "error";

  return (
    <div className="mini-chat">
      <div className="mini-chat-header">
        <div className="mini-chat-dot" />
        <span>Orientación legal instantánea — pregúntame sobre la ley checa de extranjería</span>
      </div>

      {!isAnswering && !showFallback && (
        <form onSubmit={handleSubmit} className="mini-chat-form">
          <textarea
            ref={textareaRef}
            className="mini-chat-input"
            rows={3}
            placeholder="Ejemplo: ¿Qué dice la ley sobre renovar mi pobyt después del vencimiento? ¿Puedo cambiar de empleador con un permiso de trabajo?"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            maxLength={1500}
            disabled={state.phase === "loading"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }
            }}
          />
          <div className="mini-chat-actions">
            <span className="mini-chat-chars">{consulta.length}/1500</span>
            <button
              type="submit"
              className="mini-chat-send"
              disabled={!consulta.trim() || state.phase === "loading"}
            >
              {state.phase === "loading" ? "Consultando..." : "Consultar →"}
            </button>
          </div>
        </form>
      )}

      {(isAnswering || showFallback) && (
        <div ref={responseRef} className="mini-chat-response">
          <p className="mini-chat-question">"{consulta}"</p>

          {isAnswering && (
            <div className="mini-chat-answer">
              {state.text}
              {state.phase === "streaming" && <span className="mini-chat-cursor" />}
            </div>
          )}

          {showFallback && (
            <div className="mini-chat-fallback">
              <p>{state.phase === "limite" || state.phase === "error" ? (state as { mensaje: string }).mensaje : ""}</p>
              <a href="#contacto" className="btn-primary" style={{ display: "inline-block", marginTop: "16px", fontSize: "0.95rem", padding: "12px 24px" }}>
                Déjame tu caso por formulario →
              </a>
            </div>
          )}

          {state.phase === "done" && (
            <button onClick={handleReset} className="mini-chat-reset">
              Hacer otra consulta
            </button>
          )}
        </div>
      )}

      <p className="mini-chat-disclaimer">
        Orientación informativa sobre la ley checa, no dictamen jurídico. Para revisar tu caso concreto, agenda una consulta personal.
      </p>
    </div>
  );
}
