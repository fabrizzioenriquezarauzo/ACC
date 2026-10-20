// Fotos reales de Arequipa Combat Club (servidas desde /public/fotos)
const f = (id) => `/fotos/dscf${id}.jpg`;

export const FOTOS = {
  patadaJaula: f('0109'),      // Patada alta dentro de la jaula
  mmaControl: f('0168'),       // Control desde arriba en la jaula (MMA)
  estiramiento: f('0396'),     // Estiramiento / movilidad
  calentamiento: f('0402'),    // Calentamiento grupal frente al mural ACC
  profesor: f('0408'),         // Profesor dando indicaciones
  descanso: f('0411'),         // Descanso junto a los grados de Kick Boxing
  shadow: f('0412'),           // Shadow boxing grupal
  rodillazo: f('0418'),        // Rodillazo en guardia
  guardiaVertical: f('0425'),  // Guardia en el octágono (vertical)
  patadaAlta: f('0457'),       // Patada alta junto a la jaula
  guardiaBoxeo: f('0487'),     // Guardia de boxeo
  jiuJitsu: f('0497'),         // Drill de Jiu Jitsu / clinch
  clinch: f('0531'),           // Clinch de pie
  derribo: f('0633'),          // Derribo (single leg)
  suelo: f('0678'),            // Control de espalda en el suelo
  principios: f('0876'),       // Saco con los principios del camino
  saludo: f('0893'),           // Saludo de respeto
  teamLeon: f('0896'),         // Saludo Team León
  ambiente: f('0907'),         // Buen ambiente en clase
  grappling: f('2541'),        // Grappling frente al mural ACC
  atrapada: f('2567'),         // Atrapada de patada en la jaula
  demostracion: f('2725'),     // Clase demostrativa
  formacion: f('2733'),        // Formación al inicio de clase
};

// Imagen asignada a cada sede (consistente en todo el sitio)
export const SEDE_IMG = {
  bustamante: '/assets/bustamante.png',
  sachaca: FOTOS.formacion,
  cerroColorado: FOTOS.calentamiento,
  cercado: FOTOS.grappling,
  general: FOTOS.demostracion,
};

// Álbum completo para la galería del Home
export const GALERIA = [
  { src: FOTOS.mmaControl, alt: 'Control desde arriba en la jaula', cat: 'MMA', size: 'xl' },
  { src: FOTOS.patadaAlta, alt: 'Patada alta junto a la jaula', cat: 'Striking' },
  { src: FOTOS.jiuJitsu, alt: 'Drill de Jiu Jitsu', cat: 'Grappling' },
  { src: FOTOS.guardiaVertical, alt: 'Guardia en el octágono', cat: 'Striking', size: 'tall' },
  { src: FOTOS.teamLeon, alt: 'Respeto Team León', cat: 'Comunidad', size: 'wide' },
  { src: FOTOS.shadow, alt: 'Shadow boxing grupal', cat: 'Striking' },
  { src: FOTOS.suelo, alt: 'Control de espalda en el suelo', cat: 'Grappling' },
  { src: FOTOS.atrapada, alt: 'Atrapada de patada en la jaula', cat: 'MMA' },
  { src: FOTOS.formacion, alt: 'Formación al inicio de clase', cat: 'Comunidad', size: 'wide' },
  { src: FOTOS.guardiaBoxeo, alt: 'Guardia de boxeo', cat: 'Striking' },
  { src: FOTOS.derribo, alt: 'Derribo single leg', cat: 'Grappling' },
  { src: FOTOS.patadaJaula, alt: 'Patada alta dentro de la jaula', cat: 'MMA', size: 'xl' },
  { src: FOTOS.saludo, alt: 'Saludo de respeto antes de entrenar', cat: 'Comunidad' },
  { src: FOTOS.rodillazo, alt: 'Rodillazo en guardia', cat: 'Striking' },
  { src: FOTOS.clinch, alt: 'Clinch de pie', cat: 'Grappling' },
  { src: FOTOS.ambiente, alt: 'Buen ambiente en cada clase', cat: 'Comunidad' },
  { src: FOTOS.grappling, alt: 'Grappling frente al mural ACC', cat: 'Grappling', size: 'wide' },
  { src: FOTOS.calentamiento, alt: 'Calentamiento grupal', cat: 'Comunidad' },
  { src: FOTOS.profesor, alt: 'El profesor corrigiendo la técnica', cat: 'Comunidad' },
  { src: FOTOS.estiramiento, alt: 'Estiramiento y movilidad', cat: 'Comunidad' },
  { src: FOTOS.descanso, alt: 'Descanso entre rounds', cat: 'Comunidad' },
  { src: FOTOS.demostracion, alt: 'Clase demostrativa', cat: 'Comunidad', size: 'wide' },
  { src: FOTOS.principios, alt: 'Los principios del camino', cat: 'Comunidad' },
];
