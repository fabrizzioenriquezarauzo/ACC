/**
 * Servicio de Registro de Alumnos – ACC
 * ------------------------------------------------------------
 * Hoy: guarda cada registro en el navegador (localStorage) para que
 * el panel de administración pueda verlos y exportarlos a Excel (CSV).
 *
 * Mañana (base de datos real): define la variable de entorno
 *   VITE_REGISTRO_API_URL=https://tu-backend.com/api/registros
 * en un archivo `.env` y cada registro se enviará automáticamente
 * por POST (JSON) a ese endpoint. Si el envío falla (sin internet en
 * la sede), el registro queda en cola y se reintenta solo.
 *
 * Para Firebase / Supabase solo hay que reemplazar `enviarAlBackend`.
 */

const STORAGE_KEY = 'acc_registros_v1';
const QUEUE_KEY = 'acc_registros_pendientes_v1';
const API_URL = import.meta.env.VITE_REGISTRO_API_URL;

export const SEDES = [
  { id: 'bustamante', code: 'JLB', name: 'José Luis Bustamante y Rivero', short: 'JLByR', address: 'Av. Dolores 789' },
  { id: 'sachaca', code: 'SAC', name: 'Sachaca', short: 'Sachaca', address: 'Av. Fernandini 405' },
  { id: 'cerro-colorado', code: 'CCO', name: 'Cerro Colorado', short: 'C. Colorado', address: 'Av. Ejército 1020' },
  { id: 'cercado', code: 'CER', name: 'Cercado', short: 'Cercado', address: 'Calle Mercaderes 210' },
];

export const DISCIPLINAS = ['Boxeo', 'Kick Boxing', 'MMA', 'Jiu Jitsu'];

const leer = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
};
const escribir = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function generarCodigo(sedeId) {
  const sede = SEDES.find(s => s.id === sedeId);
  const total = leer(STORAGE_KEY).filter(r => r.sede === sedeId).length + 1;
  const year = new Date().getFullYear().toString().slice(-2);
  return `ACC-${sede?.code || 'GEN'}-${year}${String(total).padStart(4, '0')}`;
}

async function enviarAlBackend(registro) {
  if (!API_URL) return { ok: true, local: true };
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registro),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return { ok: true, local: false };
}

/** Reintenta enviar los registros que quedaron pendientes por falta de conexión. */
export async function sincronizarPendientes() {
  if (!API_URL) return;
  const pendientes = leer(QUEUE_KEY);
  const restantes = [];
  for (const r of pendientes) {
    try { await enviarAlBackend(r); } catch { restantes.push(r); }
  }
  escribir(QUEUE_KEY, restantes);
}

/** Guarda un registro nuevo. Devuelve el registro con su código de alumno. */
export async function guardarRegistro(datos) {
  const registro = {
    ...datos,
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    codigo: generarCodigo(datos.sede),
    estado: 'nuevo', // nuevo → contactado → matriculado
    fechaRegistro: new Date().toISOString(),
    origen: datos.modoKiosko ? 'kiosko-sede' : 'web',
  };
  delete registro.modoKiosko;

  escribir(STORAGE_KEY, [registro, ...leer(STORAGE_KEY)]);

  try {
    await enviarAlBackend(registro);
  } catch {
    escribir(QUEUE_KEY, [...leer(QUEUE_KEY), registro]);
  }
  return registro;
}

export function listarRegistros(sedeId) {
  const all = leer(STORAGE_KEY);
  return sedeId ? all.filter(r => r.sede === sedeId) : all;
}

export function actualizarEstado(id, estado) {
  escribir(STORAGE_KEY, leer(STORAGE_KEY).map(r => (r.id === id ? { ...r, estado } : r)));
}

export function existeDocumento(numDoc) {
  return leer(STORAGE_KEY).some(r => r.numDoc === numDoc);
}

export function calcularEdad(fecha) {
  if (!fecha) return null;
  const hoy = new Date();
  const nac = new Date(fecha);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

/** Exporta los registros a CSV (abre directo en Excel). */
export function exportarCSV(registros) {
  const cols = [
    ['codigo', 'Código'], ['fechaRegistro', 'Fecha'], ['sede', 'Sede'], ['nombres', 'Nombres'], ['apellidos', 'Apellidos'],
    ['tipoDoc', 'Tipo Doc'], ['numDoc', 'N° Doc'], ['fechaNacimiento', 'F. Nacimiento'], ['sexo', 'Sexo'],
    ['celular', 'Celular'], ['email', 'Email'], ['distrito', 'Distrito'], ['peso', 'Peso (kg)'], ['talla', 'Talla (cm)'],
    ['disciplinas', 'Disciplinas'], ['experiencia', 'Experiencia'], ['turno', 'Turno'], ['objetivo', 'Objetivo'],
    ['condicionMedica', 'Condición médica'], ['alergias', 'Alergias'], ['seguro', 'Seguro'],
    ['emergenciaNombre', 'Contacto emergencia'], ['emergenciaParentesco', 'Parentesco'], ['emergenciaTelefono', 'Tel. emergencia'],
    ['apoderadoNombre', 'Apoderado'], ['apoderadoDni', 'DNI apoderado'], ['comoNosConocio', 'Cómo nos conoció'],
    ['autorizaImagen', 'Autoriza imagen'], ['estado', 'Estado'], ['origen', 'Origen'],
  ];
  const esc = (v) => {
    const s = Array.isArray(v) ? v.join(' / ') : v === true ? 'Sí' : v === false ? 'No' : (v ?? '');
    return `"${String(s).replace(/"/g, '""')}"`;
  };
  const csv = [cols.map(c => esc(c[1])).join(','), ...registros.map(r => cols.map(([k]) => {
    if (k === 'sede') return esc(SEDES.find(s => s.id === r.sede)?.name || r.sede);
    if (k === 'fechaRegistro') return esc(new Date(r.fechaRegistro).toLocaleString('es-PE'));
    return esc(r[k]);
  }).join(','))].join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `registros-acc-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
