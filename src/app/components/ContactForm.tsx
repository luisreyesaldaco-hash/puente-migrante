"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
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
          <input type="text" id="nombre" name="nombre" required placeholder="Tu nombre" />
        </div>
        <div className="field">
          <label htmlFor="pais">País de origen</label>
          <input type="text" id="pais" name="pais" placeholder="México, Colombia, Venezuela..." />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="contacto">WhatsApp o email</label>
          <input type="text" id="contacto" name="contacto" required placeholder="Para responderte" />
        </div>
        <div className="field">
          <label htmlFor="tipo">Tipo de trámite</label>
          <select id="tipo" name="tipo">
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
        <textarea id="caso" name="caso" placeholder="¿Qué necesitas? ¿Hay alguna fecha límite? Mientras más detalle, mejor." />
      </div>
      <button type="submit" className="submit-btn">Enviar mi caso</button>
      <p className="form-note">Responder no te compromete a nada. Solo quiero entender cómo ayudarte.</p>
    </form>
  );
}
