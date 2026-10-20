import { Court, TimeSlot, Tournament, Coach, ClassPackage, UserProfile, CoachScheduleConfig } from '../types';

export const CLUB_DETAILS = {
  name: 'La Pantera Padel',
  tagline: 'El templo del pádel en Jovita',
  address: 'Bolívar, X6127 Jovita, Córdoba, Argentina',
  phone: '03385 43-0525',
  phoneClean: '5493385430525',
  email: 'contacto@lapanterapadel.com.ar',
  instagram: '@lapantera_padel',
  instagramUrl: 'https://instagram.com/lapantera_padel',
  mapsUrl: 'https://maps.google.com/?q=Bol%C3%ADvar+X6127+Jovita+C%C3%B3rdoba+Argentina',
  openHours: 'Lunes a Domingos de 08:00 a 00:00 hs',
  logoUrl: '/assets/aistudio/Screenshot_2026-10-20_153810_4d29d437.png',
  heroBadge: 'Cancha Oficial de Cristal Panorámico WPT 12mm',
  amenities: [
    { title: 'Cancha de Cristal Panorámico WPT', desc: 'Vidrios templados de 12mm sin columnas que bloqueen el juego' },
    { title: 'Iluminación LED', desc: 'Potencia lumínica uniforme antirreflejo para partidos nocturnos' },
    { title: 'Césped Texturizado Pro', desc: 'Monofilamento azul oficial con máxima amortiguación' },
    { title: 'Bar & Tercer Tiempo', desc: 'Bebidas frías, Pizza, Sandwiches de Milanesa' },
    { title: 'Shop & Accesorios', desc: 'Tubos de pelotas y overgrips' },
  ]
};

// ONLY ONE COURT IN THE CLUB
export const COURTS: Court[] = [
  {
    id: 'cancha-1',
    name: 'Cancha La Pantera • Cristal WPT',
    type: 'Cancha Panorámica de Cristal WPT 12mm',
    surface: 'Césped Sintético Monofilamento Azul Oficial WPT',
    glass: 'Cristal Templado 12mm Sin Columnas',
    lighting: '8 Focos LED 200W Especial Pádel',
    pricePerSlot: 16000, // $16.000 ARS por turno de 90 min ($4.000 x jugador)
    featured: true,
  },
];

export const getFormattedDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const TIME_SLOT_HOURS = [
  { time: '08:00 - 09:30', start: '08:00', end: '09:30' },
  { time: '09:30 - 11:00', start: '09:30', end: '11:00' },
  { time: '11:00 - 12:30', start: '11:00', end: '12:30' },
  { time: '14:00 - 15:30', start: '14:00', end: '15:30' },
  { time: '15:30 - 17:00', start: '15:30', end: '17:00' },
  { time: '17:00 - 18:30', start: '17:00', end: '18:30' },
  { time: '18:30 - 20:00', start: '18:30', end: '20:00' },
  { time: '20:00 - 21:30', start: '20:00', end: '21:30' },
  { time: '21:30 - 23:00', start: '21:30', end: '23:00' },
  { time: '23:00 - 00:30', start: '23:00', end: '00:30' },
];

// Clean Initial Tournaments - Starts at 0 couples, ready for real registrations
export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'torneo-apertura-2026',
    name: 'Copa Apertura La Pantera 2026',
    category: '5ta Categoría',
    startDate: '24 Oct 2026',
    endDate: '26 Oct 2026',
    prizes: '$450.000 en Premios + 2 Paletas Bullpadel Vertex + Trofeos',
    pricePerCouple: 24000,
    totalSlots: 16,
    registeredCouplesCount: 0,
    status: 'inscripciones_abiertas',
  },
  {
    id: 'torneo-suma-11',
    name: 'Master Relámpago Suma 11',
    category: 'Suma 11',
    startDate: '07 Nov 2026',
    endDate: '08 Nov 2026',
    prizes: '$280.000 + Indumentaria Oficial Pantera + Asado de Clausura',
    pricePerCouple: 20000,
    totalSlots: 16,
    registeredCouplesCount: 0,
    status: 'inscripciones_abiertas',
  },
];

// HEAD COACH: Prof. Tomás Villemur
export const HEAD_COACH: Coach = {
  id: 'coach-tomas',
  name: 'Prof. Tomás Villemur',
  role: 'Director Deportivo & Entrenador Oficial',
  bio: 'Profesor y jugador de pádel de alto rendimiento. Especialista en corrección técnica de bandeja, víbora, lectura de rebotes en cristal y armado táctico de parejas. Más de 10 años formando jugadores competitivos en Jovita y la región.',
  avatar: '/assets/aistudio/Gemini_Generated_Image_p7z1m1p7z1m1p7z1_ffb68161.jpg',
  rating: 5.0,
  experienceYears: 10,
};

export const INITIAL_COACH_SCHEDULE: CoachScheduleConfig = {
  availableHours: ['09:00', '10:30', '16:00', '17:30', '19:00', '20:30'],
  activeDaysOfWeek: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
};

export const CLASS_PACKAGES: ClassPackage[] = [
  {
    id: 'clase-individual',
    title: 'Clase Particular 1 a 1',
    durationMinutes: 60,
    maxStudents: 1,
    price: 9000,
    description: 'Enfoque técnico milimétrico con el Prof. Tomás Villemur: empuñadura, punto de impacto y análisis de golpe.',
    level: 'Todos los niveles (Iniciación a 3ra)',
  },
  {
    id: 'clase-pareja',
    title: 'Clase en Pareja (Estrategia de Dobles)',
    durationMinutes: 60,
    maxStudents: 2,
    price: 13000,
    description: 'Sincronización táctica, cobertura del centro de la cancha, transiciones y definición bajo presión.',
    level: 'Intermedios & Avanzados',
  },
  {
    id: 'clinica-bandeja',
    title: 'Clínica Intensiva: Bandeja y Víbora',
    durationMinutes: 90,
    maxStudents: 4,
    price: 6500,
    description: 'Masterclass especializada en los golpes aéreos más determinantes del pádel moderno.',
    level: '4ta a 7ma Categoría',
  },
  {
    id: 'escuela-menores',
    title: 'Escuela de Menores (Formativa)',
    durationMinutes: 60,
    maxStudents: 6,
    price: 5000,
    description: 'Desarrollo motriz, técnica formativa, disciplina deportiva y partidos amistosos.',
    level: 'Infantil / Juvenil',
  },
];

export const DEMO_USER: UserProfile = {
  id: 'user_player',
  name: 'Jugador La Pantera',
  email: 'jugador@lapanterapadel.com.ar',
  phone: '03385 43-0525',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  category: '5ta Categoría',
  isAdmin: true,
};
