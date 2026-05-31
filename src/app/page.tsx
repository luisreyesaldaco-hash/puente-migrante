import ContactForm from "./components/ContactForm";
import MiniChat from "./components/MiniChat";

export default function Home() {
  return (
    <>
      <nav>
        <div className="nav-inner">
          <div className="brand">
            <span className="mark">PM</span>
            Puente Migrante
          </div>
          <a href="#contacto" className="nav-cta">Cuéntame tu caso</a>
        </div>
      </nav>

      <header>
        <div className="wrap">
          <span className="eyebrow"><span className="dot" /> Para latinos en República Checa</span>
          <h1>Tus trámites en Chequia, explicados <em>en tu idioma</em>.</h1>
          <p className="lead">
            Visa, pobyt, renovaciones, documentos rechazados. Un abogado que te habla en español,
            entiende el sistema checo y te dice qué hacer — paso a paso, sin que te pierdas en la burocracia.
          </p>
          <div className="hero-cta">
            <a href="#orientacion" className="btn-primary">Consulta la ley ahora</a>
            <a href="#como" className="btn-ghost">Cómo funciona →</a>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <CheckIcon />
              Abogado hispanohablante
            </div>
            <div className="trust-item">
              <CheckIcon />
              Traducción jurada certificada
            </div>
            <div className="trust-item">
              <CheckIcon />
              Red de abogados checos habilitados
            </div>
          </div>
        </div>
      </header>

      <section id="orientacion">
        <div className="wrap">
          <div className="sec-label">Consulta gratuita</div>
          <h2 className="sec-title">Pregúntame sobre la ley checa de extranjería.</h2>
          <p className="sec-intro">
            Respondo con la legislación vigente, en español, al instante. Sin dictámenes — solo te explico qué dice la ley para que llegues preparado a tu consulta.
          </p>
          <MiniChat />
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="empathy">
            <div className="sec-label">El problema</div>
            <h2 className="sec-title">Llegar es difícil. La burocracia checa lo hace peor.</h2>
            <div className="pain-grid">
              <div className="pain">
                <h4>No entiendes el papeleo</h4>
                <p>Formularios en checo, requisitos que cambian, sellos que faltan. Un error y te rechazan la solicitud.</p>
              </div>
              <div className="pain">
                <h4>Nadie te explica claro</h4>
                <p>Las oficinas no atienden en español y la información en línea está fragmentada o desactualizada.</p>
              </div>
              <div className="pain">
                <h4>Pagas de más por miedo</h4>
                <p>Sin saber qué es urgente y qué no, terminas contratando servicios caros que quizá ni necesitas.</p>
              </div>
              <div className="pain">
                <h4>El reloj corre</h4>
                <p>Los plazos migratorios no perdonan. Un trámite tarde puede costarte tu estancia legal.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="como">
        <div className="wrap">
          <div className="sec-label">Cómo funciona</div>
          <h2 className="sec-title">Un proceso claro, sin sorpresas.</h2>
          <p className="sec-intro">
            Empezamos por entender tu caso. Si lo puedo resolver con orientación y gestión, lo hacemos.
            Si necesita un abogado checo habilitado, te conecto con el indicado — sin que pierdas tiempo ni dinero adivinando.
          </p>
          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <h3>Me cuentas tu caso</h3>
              <p>Por formulario o llamada. En español, sin tecnicismos. Reviso tu situación y los documentos que tengas.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <h3>Hago el triage</h3>
              <p>Te digo con honestidad qué necesitas: si es orientación y gestión documental, o si requiere un abogado checo para litigio.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <h3>Resolvemos o derivamos</h3>
              <p>Te acompaño en el trámite y la traducción jurada, o te conecto con el abogado habilitado correcto en Chequia.</p>
            </div>
            <div className="step">
              <div className="step-num">04</div>
              <h3>No te suelto</h3>
              <p>Seguimiento hasta que tu trámite avance. Sigues hablando conmigo, en tu idioma, en cada paso.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="why">
            <div className="sec-label">Por qué conmigo</div>
            <h2 className="sec-title">Confianza primero. Resultados después.</h2>
            <div className="why-grid">
              <div className="why-item">
                <div className="why-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3L2 9l10 6 10-6-10-6zM2 9v6M22 9v6M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
                  </svg>
                </div>
                <div>
                  <h4>Soy abogado</h4>
                  <p>Formación jurídica real. Sé leer un requisito, detectar un error y entender qué está en juego en tu caso.</p>
                </div>
              </div>
              <div className="why-item">
                <div className="why-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
                  </svg>
                </div>
                <div>
                  <h4>Traducción jurada certificada</h4>
                  <p>Traductora oficial certificada en el equipo. Tus documentos quedan listos para presentarse, sin rebotes.</p>
                </div>
              </div>
              <div className="why-item">
                <div className="why-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <div>
                  <h4>Hablamos el mismo idioma</h4>
                  <p>Literal y culturalmente. Entiendo de dónde vienes y te explico el sistema checo sin que te sientas tonto.</p>
                </div>
              </div>
              <div className="why-item">
                <div className="why-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
                  </svg>
                </div>
                <div>
                  <h4>Red de abogados checos</h4>
                  <p>Cuando tu caso necesita un profesional habilitado en Chequia, ya sé a quién acudir. No empiezas de cero.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto">
        <div className="wrap">
          <div className="cta-band">
            <div className="sec-label">Primer paso</div>
            <h2 className="sec-title">Cuéntame tu caso. La primera revisión es gratis.</h2>
            <p className="sec-intro">
              Llena el formulario y te respondo personalmente. Entre más me cuentes, mejor puedo orientarte desde el primer mensaje.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="disclaimer">
          <strong>Aviso importante.</strong> Este servicio ofrece <strong>orientación informativa,
          gestión de trámites y traducción de documentos</strong> para personas hispanohablantes en
          la República Checa. No constituye asesoría jurídica vinculante sobre derecho checo. Cuando
          un caso requiere representación legal o un dictamen jurídico bajo la legislación checa, se
          deriva a un abogado debidamente habilitado ante la Česká advokátní komora (Colegio de
          Abogados de la República Checa). La revisión inicial no crea una relación abogado–cliente.
        </div>
      </div>

      <footer>
        <div className="wrap">
          <div className="brand"><span className="mark">PM</span> Puente Migrante</div>
          <div className="social">
            <a href="#">Instagram</a>
            <a href="https://wa.me/420605196668" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="mailto:luisreyesaldaco@gmail.com">Email</a>
          </div>
          <small>Praga, República Checa · Orientación migratoria para la comunidad latina</small>
        </div>
      </footer>
    </>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
