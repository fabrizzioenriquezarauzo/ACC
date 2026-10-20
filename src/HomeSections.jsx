import React, { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, MapPin, Flame, Users, Award } from 'lucide-react'
import { FOTOS, GALERIA } from './photos'
import './HomeSections.css'

/* Reveal-on-scroll: añade .is-visible a los elementos .reveal dentro del contenedor */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
  return ref;
}

/* ---------- Hero slideshow (fotos reales con crossfade + Ken Burns) ---------- */
const HERO_SLIDES = [
  { src: FOTOS.mmaControl, pos: 'center 35%' },
  { src: FOTOS.patadaAlta, pos: '40% center' },
  { src: FOTOS.teamLeon, pos: 'center 30%' },
  { src: FOTOS.atrapada, pos: 'center 40%' },
];

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => setIndex(i => (i + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="hero-slides" aria-hidden="true">
        {HERO_SLIDES.map((s, i) => (
          <img
            key={s.src}
            src={s.src}
            alt=""
            className={`hero-slide ${i === index ? 'active' : ''}`}
            style={{ objectPosition: s.pos }}
            fetchPriority={i === 0 ? 'high' : 'low'}
            decoding="async"
          />
        ))}
      </div>
      <div className="hero-dots">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            id={`hero-dot-${i}`}
            aria-label={`Ver foto ${i + 1}`}
            className={`hero-dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </>
  );
}

/* ---------- Secciones del Home ---------- */
const DISCIPLINAS = [
  { n: '01', name: 'Boxeo', img: FOTOS.guardiaBoxeo, pos: '45% 30%', desc: 'Guardia, desplazamiento y golpeo preciso. La base de todo peleador.' },
  { n: '02', name: 'Kick Boxing', img: FOTOS.patadaAlta, pos: '42% center', desc: 'Golpes y patadas combinados con potencia, ritmo y velocidad.' },
  { n: '03', name: 'MMA', img: FOTOS.mmaControl, pos: '50% 40%', desc: 'El deporte de combate más completo: striking, lucha y suelo.' },
  { n: '04', name: 'Jiu Jitsu', img: FOTOS.suelo, pos: '72% center', desc: 'Control, palancas y estrangulaciones. Vence con técnica, no con fuerza.' },
];

const PRINCIPIOS = [
  'Tratar de perfeccionar el carácter',
  'Ser correcto, leal y puntual',
  'Superarse y ser honesto',
  'Respetar a los demás',
  'Abstenerse de procederes violentos',
];

const CATEGORIAS = ['Todos', 'Striking', 'Grappling', 'MMA', 'Comunidad'];

export default function HomeSections({ onJoin, onSedes, onRegistro }) {
  const rootRef = useReveal();
  const [filtro, setFiltro] = useState('Todos');
  const [lightbox, setLightbox] = useState(null); // índice dentro de `fotos`
  const dialogRef = useRef(null);

  const fotos = filtro === 'Todos' ? GALERIA : GALERIA.filter(g => g.cat === filtro);

  const openAt = (i) => {
    setLightbox(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback((d) => {
    setLightbox(i => (i === null ? i : (i + d + fotos.length) % fotos.length));
  }, [fotos.length]);

  // Teclado + fallback de light-dismiss para navegadores sin `closedby`
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    const onClick = (e) => {
      if ('closedBy' in HTMLDialogElement.prototype) return;
      if (e.target === dialog) dialog.close();
    };
    const onClose = () => setLightbox(null);
    dialog.addEventListener('keydown', onKey);
    dialog.addEventListener('click', onClick);
    dialog.addEventListener('close', onClose);
    return () => {
      dialog.removeEventListener('keydown', onKey);
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('close', onClose);
    };
  }, [step]);

  const current = lightbox !== null ? fotos[lightbox] : null;

  return (
    <div className="home-sections" ref={rootRef}>

      {/* Banda animada */}
      <div className="acc-marquee" aria-hidden="true">
        <div className="acc-marquee-track">
          {[...Array(2)].map((_, k) => (
            <span key={k}>
              BOXEO <i>✦</i> KICK BOXING <i>✦</i> MMA <i>✦</i> JIU JITSU <i>✦</i> TEAM LEÓN <i>✦</i> AREQUIPA COMBAT CLUB <i>✦</i>&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Disciplinas */}
      <section id="disciplinas" className="hs-section">
        <div className="hs-container">
          <header className="hs-header reveal">
            <span className="hs-eyebrow">Lo que entrenamos</span>
            <h2 className="hs-title">Nuestras <span>Disciplinas</span></h2>
            <p className="hs-sub">Elige tu camino. Todas las clases son guiadas por profesores con experiencia real en competencia.</p>
          </header>

          <div className="disc-grid">
            {DISCIPLINAS.map((d, i) => (
              <article key={d.name} className="disc-card reveal" style={{ '--delay': `${i * 90}ms` }}>
                <img src={d.img} alt={`Clase de ${d.name} en ACC`} loading="lazy" decoding="async" style={{ objectPosition: d.pos }} />
                <div className="disc-overlay" />
                <div className="disc-content">
                  <span className="disc-num">{d.n}</span>
                  <h3>{d.name}</h3>
                  <p>{d.desc}</p>
                  <button className="disc-link" id={`disc-${d.name.toLowerCase().replace(/\s/g, '-')}`} onClick={onJoin}>Ver planes →</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Filosofía */}
      <section className="hs-section philo">
        <div className="hs-container philo-grid">
          <div className="philo-media reveal">
            <img className="philo-main" src={FOTOS.principios} alt="Saco con los principios del camino del guerrero" loading="lazy" decoding="async" />
            <img className="philo-inset" src={FOTOS.saludo} alt="Alumnos saludando con respeto antes de entrenar" loading="lazy" decoding="async" />
            <div className="philo-badge"><Award size={18} /> Disciplina · Respeto · Honor</div>
          </div>
          <div className="philo-text reveal" style={{ '--delay': '120ms' }}>
            <span className="hs-eyebrow">Nuestra filosofía</span>
            <h2 className="hs-title left">El camino <span>del guerrero</span></h2>
            <p className="hs-sub left">En ACC no solo formamos peleadores: formamos personas. Cada clase empieza y termina con respeto, y estos principios están escritos en nuestros sacos para recordarlos en cada golpe.</p>
            <ol className="philo-list">
              {PRINCIPIOS.map((p, i) => (
                <li key={p}><span>{String(i + 1).padStart(2, '0')}</span>{p}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Comunidad Team León */}
      <section className="hs-section">
        <div className="hs-container">
          <header className="hs-header reveal">
            <span className="hs-eyebrow">Team León</span>
            <h2 className="hs-title">Más que un gimnasio, <span>una familia</span></h2>
          </header>

          <div className="bento">
            <figure className="bento-item bento-big reveal">
              <img src={FOTOS.teamLeon} alt="Saludo entre compañeros del Team León" loading="lazy" decoding="async" style={{ objectPosition: 'center 30%' }} />
              <figcaption><strong>Respeto</strong> dentro y fuera del tatami</figcaption>
            </figure>
            <figure className="bento-item reveal" style={{ '--delay': '80ms' }}>
              <img src={FOTOS.ambiente} alt="Alumnos riendo durante la clase" loading="lazy" decoding="async" />
              <figcaption><strong>Buen ambiente</strong> en cada clase</figcaption>
            </figure>
            <figure className="bento-item reveal" style={{ '--delay': '160ms' }}>
              <img src={FOTOS.formacion} alt="Formación de alumnos al inicio de la clase" loading="lazy" decoding="async" />
              <figcaption><strong>Disciplina</strong> desde el primer día</figcaption>
            </figure>
            <div className="bento-item bento-stats reveal" style={{ '--delay': '120ms' }}>
              <div><MapPin size={22} /><b>4</b><span>Sedes en Arequipa</span></div>
              <div><Flame size={22} /><b>4</b><span>Disciplinas</span></div>
              <div><Users size={22} /><b>3</b><span>Clases gratis</span></div>
            </div>
            <figure className="bento-item reveal" style={{ '--delay': '200ms' }}>
              <img src={FOTOS.demostracion} alt="Clase demostrativa guiada por el profesor" loading="lazy" decoding="async" />
              <figcaption><strong>Profesores</strong> que te corrigen de cerca</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Galería */}
      <section id="galeria" className="hs-section gallery-section">
        <div className="hs-container">
          <header className="hs-header reveal">
            <span className="hs-eyebrow">Galería</span>
            <h2 className="hs-title">Así se vive <span>ACC</span></h2>
            <p className="hs-sub">Fotos reales de nuestros entrenamientos. Toca cualquier foto para verla en grande.</p>
          </header>

          <div className="gallery-filters reveal" role="tablist" aria-label="Filtrar galería">
            {CATEGORIAS.map(c => (
              <button
                key={c}
                id={`gal-filter-${c.toLowerCase()}`}
                role="tab"
                aria-selected={filtro === c}
                className={filtro === c ? 'active' : ''}
                onClick={() => setFiltro(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="gallery-grid" key={filtro}>
            {fotos.map((g, i) => (
              <button
                key={g.src}
                id={`gal-item-${i}`}
                className={`gallery-item ${filtro === 'Todos' && g.size ? `g-${g.size}` : ''} ${g.size === 'tall' ? 'g-tall' : ''}`}
                style={{ '--i': i }}
                onClick={() => openAt(i)}
                aria-label={`Abrir foto: ${g.alt}`}
              >
                <img src={g.src} alt={g.alt} loading="lazy" decoding="async" />
                <span className="gallery-cap"><em>{g.cat}</em>{g.alt}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="cta-band" style={{ '--cta-img': `url(${FOTOS.grappling})` }}>
        <div className="hs-container cta-inner reveal">
          <span className="hs-eyebrow light">Tu primera clase te espera</span>
          <h2>Empieza hoy. <span>Las 3 primeras clases van por nosotros.</span></h2>
          <div className="cta-btns">
            <button id="cta-registro" className="btn btn-primary" onClick={onRegistro}>Regístrate gratis</button>
            <button id="cta-join" className="btn btn-outline" onClick={onJoin}>Ver Membresías</button>
            <button id="cta-sedes" className="btn btn-outline" onClick={onSedes}>Encuentra tu sede</button>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <dialog ref={dialogRef} className="lightbox" closedby="any" aria-label="Visor de fotos">
        {current && (
          <>
            <img src={current.src} alt={current.alt} />
            <div className="lightbox-bar">
              <span><em>{current.cat}</em> {current.alt}</span>
              <span>{lightbox + 1} / {fotos.length}</span>
            </div>
            <button id="lightbox-prev" className="lb-btn lb-prev" onClick={() => step(-1)} aria-label="Foto anterior"><ChevronLeft size={28} /></button>
            <button id="lightbox-next" className="lb-btn lb-next" onClick={() => step(1)} aria-label="Foto siguiente"><ChevronRight size={28} /></button>
            <button id="lightbox-close" className="lb-btn lb-close" onClick={close} aria-label="Cerrar"><X size={24} /></button>
          </>
        )}
      </dialog>
    </div>
  );
}
