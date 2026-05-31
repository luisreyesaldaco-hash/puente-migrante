"use client";

import { useState } from "react";

type Fields = {
  nombre: string;
  pais: string;
  contacto: string;
  tipo: string;
  caso: string;
};

const EMPTY: Fields = { nombre: "", pais: "", contacto: "", tipo: "", caso: "" };

export default function ContactForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Error al enviar. Intenta de nuevo.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="form-success">
        ✓ ¡Gracias! Recibí tu caso y te responderé personalmente muy pronto. Revisa tu WhatsApp o email.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input type="text" id="nombre" required placeholder="Tu nombre" value={fields.nombre} onChange={set("nombre")} />
        </div>
        <div className="field">
          <label htmlFor="pais">País de origen</label>
          <input type="text" id="pais" placeholder="México, Colombia, Venezuela..." value={fields.pais} onChange={set("pais")} />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="contacto">WhatsApp o email</label>
          <input type="text" id="contacto" required placeholder="Para responderte" value={fields.contacto} onChange={set("contacto")} />
        </div>
        <div className="field">
          <label htmlFor="tipo">Tipo de trámite</label>
          <select id="tipo" value={fields.tipo} onChange={set("tipo")}>
            <option value="">Selecciona...</option>
            <option>Visa / primer permiso de estancia</option>
            <option>Renovación de pobyt</option>
            <option>Solicitud rechazada</option>
            <option>Reunificación familiar</option>
            <option>Traducción de documentos</option>
            <option>Otro / no estoy seguro</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="caso">Cuéntame tu situación</label>
        <textarea id="caso" placeholder="¿Qué necesitas? ¿Hay alguna fecha límite? Mientras más detalle, mejor." value={fields.caso} onChange={set("caso")} />
      </div>
      {error && <p style={{ color: "#c2410c", fontSize: "0.88rem" }}>{error}</p>}
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Enviando..." : "Enviar mi caso"}
      </button>
      <p className="form-note">Responder no te compromete a nada. Solo quiero entender cómo ayudarte.</p>
    </form>
  );
}
