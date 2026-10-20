import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, X, User, Dumbbell, ShieldCheck, Download, ExternalLink, Copy, MapPin } from 'lucide-react'
import { FOTOS } from './photos'
import { SEDES, DISCIPLINAS, guardarRegistro, calcularEdad, existeDocumento, listarRegistros, actualizarEstado, exportarCSV, sincronizarPendientes } from './services/registroService'
import './RegistroAlumno.css'

const PASOS = [
  { id: 'personal', label: 'Datos personales', icon: User, img: FOTOS.saludo },
  { id: 'entrenamiento', label: 'Entrenamiento', icon: Dumbbell, img: FOTOS.patadaAlta },
  { id: 'confirmar', label: 'Confirmación', icon: ShieldCheck, img: FOTOS.teamLeon },
];

const DISTRITOS = ['Arequipa (Cercado)', 'José Luis Bustamante y Rivero', 'Sachaca', 'Cerro Colorado', 'Cayma', 'Yanahuara', 'Paucarpata', 'Mariano Melgar', 'Miraflores', 'Socabaya', 'Hunter', 'Tiabaya', 'Alto Selva Alegre', 'Characato', 'Sabandía', 'Yura', 'Otro'];

const INICIAL = {
  nombres: '', apellidos: '', tipoDoc: 'DNI', numDoc: '', fechaNacimiento: '', sexo: '', celular: '', email: '', distrito: '',
  sede: '', disciplinas: [], peso: '', talla: '', experiencia: '', turno: '', objetivo: '',
  emergenciaNombre: '', emergenciaParentesco: '', emergenciaTelefono: '',
  apoderadoNombre: '', apoderadoDni: '',
  comoNosConocio: '', aceptaReglamento: false, aceptaRiesgos: false, aceptaDatos: false, autorizaImagen: false,
};

const DOC_RULES = {
  DNI: { pattern: '\\d{8}', inputMode: 'numeric', maxLength: 8, hint: '8 dígitos' },
  CE: { pattern: '[A-Za-z0-9]{9,12}', inputMode: 'text', maxLength: 12, hint: '9 a 12 caracteres' },
  Pasaporte: { pattern: '[A-Za-z0-9]{6,12}', inputMode: 'text', maxLength: 12, hint: '6 a 12 caracteres' },
};

/* ---------- Pequeños componentes de campo ---------- */
function Field({ id, label, required, hint, children, full }) {
  return (
    <div className={`rg-field ${full ? 'full' : ''}`}>
      <label htmlFor={id}>{label}{required && <span className="rg-req" aria-hidden="true"> *</span>}</label>
      {children}
      {hint && <small id={`${id}-hint`} className="rg-hint">{hint}</small>}
    </div>
  );
}

function RadioGroup({ name, legend, options, value, onChange, required, cols }) {
  return (
    <fieldset className="rg-field full rg-radios">
      <legend>{legend}{required && <span className="rg-req" aria-hidden="true"> *</span>}</legend>
      <div className="rg-chips" style={cols ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined}>
        {options.map((o, i) => {
          const val = typeof o === 'string' ? o : o.value;
          const text = typeof o === 'string' ? o : o.label;
          const sub = typeof o === 'string' ? null : o.sub;
          return (
            <label key={val} className={`rg-chip ${value === val ? 'checked' : ''}`}>
              <input type="radio" name={name} value={val} checked={value === val} onChange={() => onChange(val)} required={required && i === 0} />
              <span>{text}{sub && <em>{sub}</em>}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* =========================================================
   Formulario de registro
   ========================================================= */
export default function RegistroAlumno({ onClose, kiosko = false, sedeFija = '' }) {
  const [paso, setPaso] = useState(0);
  const [data, setData] = useState({ ...INICIAL, sede: sedeFija });
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [cuenta, setCuenta] = useState(20);
  const formRef = useRef(null);
  const discRef = useRef(null);
  const docRef = useRef(null);
  const topRef = useRef(null);

  const set = (k) => (e) => {
    const v = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setData(d => ({ ...d, [k]: v }));
  };

  const edad = useMemo(() => calcularEdad(data.fechaNacimiento), [data.fechaNacimiento]);
  const esMenor = edad !== null && edad < 18;
  const imc = useMemo(() => {
    const p = parseFloat(data.peso), t = parseFloat(data.talla) / 100;
    return p && t ? (p / (t * t)).toFixed(1) : null;
  }, [data.peso, data.talla]);
  const sedeObj = SEDES.find(s => s.id === data.sede);
  const doc = DOC_RULES[data.tipoDoc];

  useEffect(() => { sincronizarPendientes(); }, []);

  // Validación personalizada: al menos 1 disciplina
  useEffect(() => {
    discRef.current?.setCustomValidity(data.disciplinas.length ? '' : 'Elige al menos una disciplina.');
  }, [data.disciplinas, paso]);

  // Validación: documento ya registrado
  useEffect(() => {
    docRef.current?.setCustomValidity(data.numDoc && existeDocumento(data.numDoc) ? 'Este documento ya está registrado. Acércate a recepción.' : '');
  }, [data.numDoc, paso]);

  // Kiosko: reinicio automático tras registrar
  useEffect(() => {
    if (!resultado || !kiosko) return;
    if (cuenta <= 0) { reiniciar(); return; }
    const t = setTimeout(() => setCuenta(c => c - 1), 1000);
    return () => clearTimeout(t);
  });

  const reiniciar = () => {
    setResultado(null);
    setData({ ...INICIAL, sede: sedeFija });
    setPaso(0);
    setCuenta(20);
  };

  const irA = (n) => {
    setPaso(n);
    topRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDisc = (d) => setData(prev => ({
    ...prev,
    disciplinas: prev.disciplinas.includes(d) ? prev.disciplinas.filter(x => x !== d) : [...prev.disciplinas, d],
  }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formRef.current.reportValidity()) return;
    if (paso < PASOS.length - 1) { irA(paso + 1); return; }
    setEnviando(true);
    try {
      const reg = await guardarRegistro({
        ...data,
        nombres: data.nombres.trim(),
        apellidos: data.apellidos.trim(),
        edad,
        imc,
        modoKiosko: kiosko,
      });
      setResultado(reg);
    } finally {
      setEnviando(false);
    }
  };

  /* ---------- Pantalla de éxito ---------- */
  if (resultado) {
    return (
      <div className="rg-overlay" role="dialog" aria-modal="true" aria-labelledby="rg-ok-title">
        <div className="rg-success">
          <div className="rg-success-bg" style={{ backgroundImage: `url(${FOTOS.formacion})` }} />
          <div className="rg-success-card">
            <div className="rg-check"><Check size={44} strokeWidth={3} /></div>
            <h2 id="rg-ok-title">¡Bienvenido al Team León, {resultado.nombres.split(' ')[0]}!</h2>
            <p>Tu registro en <strong>Sede {sedeObj?.name}</strong> se completó correctamente.</p>
            <div className="rg-code">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(resultado.codigo)}`} alt={`QR del código ${resultado.codigo}`} width="120" height="120" />
              <div>
                <span>Tu código de alumno</span>
                <strong>{resultado.codigo}</strong>
                <small>Muéstralo en recepción para activar tus 3 clases gratis.</small>
              </div>
            </div>
            <div className="rg-success-actions">
              {kiosko ? (
                <button id="rg-next-student" className="rg-btn primary" onClick={reiniciar}>Registrar otro alumno ({cuenta}s)</button>
              ) : (
                <button id="rg-finish" className="rg-btn primary" onClick={onClose}>Listo</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const P = PASOS[paso];

  return (
    <div className="rg-overlay" role="dialog" aria-modal="true" aria-labelledby="rg-title">
      <div className="rg-shell">
        {/* Panel lateral con foto y progreso */}
        <aside className="rg-side">
          {PASOS.map((p, i) => (
            <img key={p.id} src={p.img} alt="" className={`rg-side-img ${i === paso ? 'active' : ''}`} />
          ))}
          <div className="rg-side-overlay" />
          <div className="rg-side-content">
            <img src="/newlogo.png" alt="Arequipa Combat Club" className="rg-logo" />
            <div>
              <span className="rg-eyebrow">{kiosko ? 'Registro en sede' : 'Inscripción online'}</span>
              <h1 id="rg-title">Únete al<br /><span>Team León</span></h1>
              <p>Completa tu ficha en menos de 2 minutos. Tus datos quedan registrados directamente en el sistema de ACC.</p>
            </div>
            <nav aria-label="Progreso del registro">
              <ol className="rg-steps">
                {PASOS.map((p, i) => {
                  const Icon = p.icon;
                  const state = i < paso ? 'done' : i === paso ? 'active' : 'todo';
                  return (
                    <li key={p.id} className={state} aria-current={i === paso ? 'step' : undefined}>
                      <button type="button" disabled={i > paso} onClick={() => irA(i)}>
                        <span className="rg-step-dot">{state === 'done' ? <Check size={16} /> : <Icon size={16} />}</span>
                        <span>{p.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
            {sedeFija && sedeObj && (
              <div className="rg-sede-tag"><MapPin size={14} /> Sede {sedeObj.name}</div>
            )}
          </div>
        </aside>

        {/* Formulario */}
        <div className="rg-main" ref={topRef}>
          <div className="rg-topbar">
            <div className="rg-progress" aria-hidden="true"><div style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }} /></div>
            <span className="rg-counter">Paso {paso + 1} de {PASOS.length}</span>
            {!kiosko && <button id="rg-close" type="button" className="rg-close" onClick={onClose} aria-label="Cerrar registro"><X size={22} /></button>}
          </div>

          <form ref={formRef} onSubmit={onSubmit} className="rg-form" noValidate={false} key={paso}>
            <header className="rg-form-head">
              <h2>{P.label}</h2>
              <p>
                {paso === 0 && 'Usa tus datos tal como aparecen en tu documento de identidad.'}
                {paso === 1 && 'Esto nos ayuda a ubicarte en el grupo y horario correcto.'}
                {paso === 2 && 'Revisa tus datos, añade un contacto de emergencia y acepta los términos para completar tu registro.'}
              </p>
            </header>

            {/* PASO 1 */}
            {paso === 0 && (
              <div className="rg-grid">
                <Field id="rg-nombres" label="Nombres" required>
                  <input id="rg-nombres" name="given-name" autoComplete="given-name" required maxLength={60} pattern="[\p{L}' .\-]+" value={data.nombres} onChange={set('nombres')} enterKeyHint="next" />
                </Field>
                <Field id="rg-apellidos" label="Apellidos" required>
                  <input id="rg-apellidos" name="family-name" autoComplete="family-name" required maxLength={80} pattern="[\p{L}' .\-]+" value={data.apellidos} onChange={set('apellidos')} enterKeyHint="next" />
                </Field>
                <RadioGroup name="tipoDoc" legend="Tipo de documento" required value={data.tipoDoc} onChange={(v) => setData(d => ({ ...d, tipoDoc: v, numDoc: '' }))}
                  options={[{ value: 'DNI', label: 'DNI' }, { value: 'CE', label: 'Carné de extranjería' }, { value: 'Pasaporte', label: 'Pasaporte' }]} cols={3} />
                <Field id="rg-doc" label={`Número de ${data.tipoDoc}`} required hint={doc.hint}>
                  <input ref={docRef} id="rg-doc" name="numDoc" required inputMode={doc.inputMode} pattern={doc.pattern} maxLength={doc.maxLength} autoComplete="off" spellCheck="false" aria-describedby="rg-doc-hint" value={data.numDoc} onChange={(e) => setData(d => ({ ...d, numDoc: e.target.value.trim() }))} />
                </Field>
                <Field id="rg-nac" label="Fecha de nacimiento" required hint={edad !== null && edad >= 0 ? `${edad} años${esMenor ? ' · se pedirá un apoderado' : ''}` : null}>
                  <input id="rg-nac" type="date" name="bday" autoComplete="bday" required min="1940-01-01" max={new Date(Date.now() - 4 * 31557600000).toISOString().slice(0, 10)} value={data.fechaNacimiento} onChange={set('fechaNacimiento')} aria-describedby="rg-nac-hint" />
                </Field>
                <RadioGroup name="sexo" legend="Sexo" required value={data.sexo} onChange={set('sexo')} options={['Masculino', 'Femenino']} cols={2} />
                <Field id="rg-cel" label="Celular (WhatsApp)" required hint="9 dígitos, empieza con 9">
                  <input id="rg-cel" type="tel" name="tel" autoComplete="tel-national" inputMode="tel" required pattern="9\d{8}" maxLength={9} aria-describedby="rg-cel-hint" value={data.celular} onChange={(e) => setData(d => ({ ...d, celular: e.target.value.replace(/\D/g, '') }))} />
                </Field>
                <Field id="rg-email" label="Correo electrónico" hint="Opcional · para tu acceso a la plataforma">
                  <input id="rg-email" type="email" name="email" autoComplete="email" spellCheck="false" maxLength={100} aria-describedby="rg-email-hint" value={data.email} onChange={set('email')} />
                </Field>
                <Field id="rg-distrito" label="Distrito donde vives" full>
                  <input id="rg-distrito" name="distrito" list="rg-distritos" autoComplete="address-level2" maxLength={60} value={data.distrito} onChange={set('distrito')} enterKeyHint="next" />
                  <datalist id="rg-distritos">{DISTRITOS.map(d => <option key={d} value={d} />)}</datalist>
                </Field>
              </div>
            )}

            {/* PASO 2 */}
            {paso === 1 && (
              <div className="rg-grid">
                <fieldset className="rg-field full">
                  <legend>Sede donde entrenarás<span className="rg-req" aria-hidden="true"> *</span></legend>
                  <div className="rg-sedes">
                    {SEDES.map((s, i) => (
                      <label key={s.id} className={`rg-sede ${data.sede === s.id ? 'checked' : ''} ${sedeFija && sedeFija !== s.id ? 'locked' : ''}`}>
                        <input type="radio" name="sede" value={s.id} required={i === 0} checked={data.sede === s.id} disabled={!!sedeFija && sedeFija !== s.id} onChange={() => setData(d => ({ ...d, sede: s.id }))} />
                        <strong>{s.short}</strong>
                        <small><MapPin size={12} /> {s.address}</small>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="rg-field full">
                  <legend>Arte marcial que quieres entrenar<span className="rg-req" aria-hidden="true"> *</span> <em className="rg-legend-note">Puedes elegir más de una</em></legend>
                  <div className="rg-chips" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {DISCIPLINAS.map((d, i) => (
                      <label key={d} className={`rg-chip big ${data.disciplinas.includes(d) ? 'checked' : ''}`}>
                        <input ref={i === 0 ? discRef : undefined} type="checkbox" name="disciplinas" value={d} checked={data.disciplinas.includes(d)} onChange={() => toggleDisc(d)} />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <Field id="rg-peso" label="Peso (kg)" required hint="Para ubicarte en tu categoría">
                  <input id="rg-peso" type="number" name="peso" inputMode="decimal" required min="20" max="200" step="0.1" aria-describedby="rg-peso-hint" value={data.peso} onChange={set('peso')} />
                </Field>
                <Field id="rg-talla" label="Talla (cm)" hint={imc ? `IMC aprox.: ${imc}` : 'Opcional'}>
                  <input id="rg-talla" type="number" name="talla" inputMode="numeric" min="100" max="230" step="1" aria-describedby="rg-talla-hint" value={data.talla} onChange={set('talla')} />
                </Field>

                <RadioGroup name="experiencia" legend="Experiencia en artes marciales" required value={data.experiencia} onChange={set('experiencia')} cols={4}
                  options={[{ value: 'Ninguna', label: 'Ninguna', sub: 'Desde cero' }, { value: 'Menos de 1 año', label: '< 1 año', sub: 'Principiante' }, { value: '1 a 3 años', label: '1 – 3 años', sub: 'Intermedio' }, { value: 'Más de 3 años', label: '+3 años', sub: 'Avanzado / compito' }]} />
                <RadioGroup name="turno" legend="Turno preferido" required value={data.turno} onChange={set('turno')} cols={3}
                  options={[{ value: 'Mañana', label: 'Mañana', sub: '6:00 – 12:00' }, { value: 'Tarde', label: 'Tarde', sub: '12:00 – 18:00' }, { value: 'Noche', label: 'Noche', sub: '18:00 – 22:00' }]} />
                <Field id="rg-objetivo" label="¿Cuál es tu objetivo principal?" required full>
                  <select id="rg-objetivo" name="objetivo" required value={data.objetivo} onChange={set('objetivo')}>
                    <option value="">Selecciona una opción</option>
                    <option>Aprender defensa personal</option>
                    <option>Bajar de peso / mejorar condición física</option>
                    <option>Competir</option>
                    <option>Disciplina y salud mental</option>
                    <option>Perfeccionar mi técnica</option>
                  </select>
                </Field>
              </div>
            )}

            {/* PASO 3: Confirmación */}
            {paso === 2 && (
              <div className="rg-grid">
                <div className="rg-summary full">
                  <div><span>Alumno</span><strong>{data.nombres} {data.apellidos}</strong></div>
                  <div><span>{data.tipoDoc}</span><strong>{data.numDoc}</strong></div>
                  <div><span>Edad</span><strong>{edad} años</strong></div>
                  <div><span>Celular</span><strong>{data.celular}</strong></div>
                  <div><span>Sede</span><strong>{sedeObj?.name}</strong></div>
                  <div><span>Disciplina</span><strong>{data.disciplinas.join(', ')}</strong></div>
                  <div><span>Peso</span><strong>{data.peso} kg</strong></div>
                  <div><span>Turno</span><strong>{data.turno}</strong></div>
                  <button type="button" id="rg-edit" className="rg-edit" onClick={() => irA(0)}>Editar datos</button>
                </div>

                <div className="rg-subtitle full">Contacto de emergencia</div>
                <Field id="rg-em-nombre" label="Nombre completo" required>
                  <input id="rg-em-nombre" name="emergenciaNombre" required maxLength={100} pattern="[\p{L}' .\-]+" value={data.emergenciaNombre} onChange={set('emergenciaNombre')} />
                </Field>
                <Field id="rg-em-par" label="Parentesco" required>
                  <select id="rg-em-par" name="emergenciaParentesco" required value={data.emergenciaParentesco} onChange={set('emergenciaParentesco')}>
                    <option value="">Selecciona</option>
                    <option>Padre / Madre</option>
                    <option>Esposo(a) / Pareja</option>
                    <option>Hermano(a)</option>
                    <option>Hijo(a)</option>
                    <option>Otro familiar</option>
                    <option>Amigo(a)</option>
                  </select>
                </Field>
                <Field id="rg-em-tel" label="Celular de emergencia" required hint="9 dígitos">
                  <input id="rg-em-tel" type="tel" name="emergenciaTelefono" inputMode="tel" required pattern="9\d{8}" maxLength={9} aria-describedby="rg-em-tel-hint" value={data.emergenciaTelefono} onChange={(e) => setData(d => ({ ...d, emergenciaTelefono: e.target.value.replace(/\D/g, '') }))} />
                </Field>

                {esMenor && (
                  <div className="rg-minor full">
                    <div className="rg-subtitle">Padre, madre o apoderado <span>(alumno menor de edad · {edad} años)</span></div>
                    <div className="rg-grid">
                      <Field id="rg-apo-nombre" label="Nombre del apoderado" required>
                        <input id="rg-apo-nombre" name="apoderadoNombre" required maxLength={100} pattern="[\p{L}' .\-]+" value={data.apoderadoNombre} onChange={set('apoderadoNombre')} />
                      </Field>
                      <Field id="rg-apo-dni" label="DNI del apoderado" required hint="8 dígitos">
                        <input id="rg-apo-dni" name="apoderadoDni" required inputMode="numeric" pattern="\d{8}" maxLength={8} aria-describedby="rg-apo-dni-hint" value={data.apoderadoDni} onChange={(e) => setData(d => ({ ...d, apoderadoDni: e.target.value.replace(/\D/g, '') }))} />
                      </Field>
                    </div>
                  </div>
                )}

                <Field id="rg-conocio" label="¿Cómo te enteraste de ACC?" full>
                  <select id="rg-conocio" name="comoNosConocio" value={data.comoNosConocio} onChange={set('comoNosConocio')}>
                    <option value="">Selecciona (opcional)</option>
                    <option>Instagram</option>
                    <option>Facebook</option>
                    <option>TikTok</option>
                    <option>Google / Google Maps</option>
                    <option>Recomendación de un amigo</option>
                    <option>Pasé por la sede</option>
                    <option>Otro</option>
                  </select>
                </Field>

                <div className="rg-consents full">
                  <label className="rg-check-row">
                    <input type="checkbox" required checked={data.aceptaReglamento} onChange={set('aceptaReglamento')} />
                    <span>He leído y acepto el <strong>reglamento interno</strong> de Arequipa Combat Club (puntualidad, higiene, respeto y uso del equipo). <b className="rg-req">*</b></span>
                  </label>
                  <label className="rg-check-row">
                    <input type="checkbox" required checked={data.aceptaRiesgos} onChange={set('aceptaRiesgos')} />
                    <span>Declaro que me encuentro en condiciones de salud aptas para entrenar y entiendo que los deportes de contacto implican <strong>riesgo de lesiones</strong>, asumiendo la responsabilidad{esMenor ? ' como apoderado' : ''}. <b className="rg-req">*</b></span>
                  </label>
                  <label className="rg-check-row">
                    <input type="checkbox" required checked={data.aceptaDatos} onChange={set('aceptaDatos')} />
                    <span>Autorizo el tratamiento de mis datos personales conforme a la <strong>Ley N.º 29733</strong> de Protección de Datos Personales, para la gestión de mi membresía y comunicaciones de ACC. <b className="rg-req">*</b></span>
                  </label>
                  <label className="rg-check-row">
                    <input type="checkbox" checked={data.autorizaImagen} onChange={set('autorizaImagen')} />
                    <span>Autorizo el uso de fotos y videos donde aparezca en las redes sociales de ACC. <em>(Opcional)</em></span>
                  </label>
                </div>
              </div>
            )}

            <div className="rg-actions">
              {paso > 0 ? (
                <button id="rg-prev" type="button" className="rg-btn ghost" onClick={() => irA(paso - 1)} enterKeyHint="previous"><ChevronLeft size={18} /> Atrás</button>
              ) : <span />}
              <button id="rg-submit" type="submit" className="rg-btn primary" disabled={enviando} enterKeyHint={paso === PASOS.length - 1 ? 'done' : 'next'}>
                {paso < PASOS.length - 1 ? <>Continuar <ChevronRight size={18} /></> : enviando ? 'Registrando…' : <>Completar registro <Check size={18} /></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Panel de administración: registros recibidos
   ========================================================= */
const ESTADOS = { nuevo: 'Nuevo', contactado: 'Contactado', matriculado: 'Matriculado' };

export function RegistrosAdmin() {
  const [filtro, setFiltro] = useState('');
  const [tick, setTick] = useState(0);
  const [copiado, setCopiado] = useState('');
  const registros = useMemo(() => listarRegistros(filtro), [filtro, tick]);

  useEffect(() => {
    const onStorage = () => setTick(t => t + 1);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const kioskUrl = (id) => `${window.location.origin}${window.location.pathname}?page=registro&sede=${id}`;
  const copiar = async (id) => {
    try { await navigator.clipboard.writeText(kioskUrl(id)); setCopiado(id); setTimeout(() => setCopiado(''), 1800); } catch { /* sin permisos */ }
  };

  return (
    <div className="admin-card glass rg-admin" style={{ gridColumn: 'span 2' }}>
      <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0 }}>Nuevos Registros</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: '4px 0 0' }}>Fichas llenadas por los alumnos desde la web o la tablet de cada sede.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select id="rg-admin-filter" className="rg-admin-select" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar por sede">
            <option value="">Todas las sedes</option>
            {SEDES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button id="rg-admin-export" className="btn-small flex-btn" onClick={() => exportarCSV(registros)} disabled={!registros.length}><Download size={14} /> Exportar Excel</button>
        </div>
      </div>

      <div className="rg-kiosk-links">
        <span>Enlace de registro para la tablet de cada sede:</span>
        {SEDES.map(s => (
          <div key={s.id} className="rg-kiosk-link">
            <strong>{s.short}</strong>
            <button id={`rg-kiosk-open-${s.id}`} onClick={() => window.open(kioskUrl(s.id), '_blank')} aria-label={`Abrir registro de ${s.name}`}><ExternalLink size={14} /></button>
            <button id={`rg-kiosk-copy-${s.id}`} onClick={() => copiar(s.id)} aria-label={`Copiar enlace de ${s.name}`}>{copiado === s.id ? <Check size={14} /> : <Copy size={14} />}</button>
          </div>
        ))}
      </div>

      {registros.length === 0 ? (
        <div className="rg-empty">Aún no hay registros{filtro ? ' en esta sede' : ''}. Abre el enlace de una sede para probar el registro.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Código</th><th>Alumno</th><th>Sede</th><th>Disciplina</th><th>Peso</th><th>Celular</th><th>Fecha</th><th>Estado</th></tr></thead>
            <tbody>
              {registros.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.codigo}</td>
                  <td>
                    <strong>{r.nombres} {r.apellidos}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{r.tipoDoc} {r.numDoc} · {r.edad} años{r.condicionMedica && !/^ningun/i.test(r.condicionMedica) ? ' · ⚠️ salud' : ''}</div>
                  </td>
                  <td>{SEDES.find(s => s.id === r.sede)?.short}</td>
                  <td>{r.disciplinas?.join(', ')}</td>
                  <td>{r.peso} kg</td>
                  <td><a href={`https://wa.me/51${r.celular}`} target="_blank" rel="noreferrer" style={{ color: '#25D366' }}>{r.celular}</a></td>
                  <td style={{ fontSize: '12px' }}>{new Date(r.fechaRegistro).toLocaleDateString('es-PE')}</td>
                  <td>
                    <select className={`rg-estado ${r.estado}`} value={r.estado} onChange={(e) => { actualizarEstado(r.id, e.target.value); setTick(t => t + 1); }} aria-label={`Estado de ${r.nombres}`}>
                      {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
