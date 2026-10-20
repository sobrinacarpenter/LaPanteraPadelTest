export type CourtId = 'cancha-1';

export const PADEL_CATEGORIES = [
  // Categorías Libres / Caballeros
  '1ra Categoría',
  '2da Categoría',
  '3ra Categoría',
  '4ta Categoría',
  '5ta Categoría',
  '6ta Categoría',
  '7ma Categoría',
  '8va Categoría / Principiantes',
  // Damas
  'Damas A',
  'Damas B',
  'Damas C',
  'Damas D',
  // Sumas de Pareja
  'Suma 7',
  'Suma 8',
  'Suma 9',
  'Suma 10',
  'Suma 11',
  'Suma 12',
  'Suma 13',
  'Suma 14',
  // Mixto y Menores
  'Mixto A',
  'Mixto B',
  'Menores Sub-16',
  'Menores Sub-14',
  'Veteranos +35',
  'Veteranos +45',
] as const;

export interface CoachScheduleConfig {
  availableHours: string[]; // e.g. ["09:00", "10:30", "16:30", "18:00", "19:30"]
  activeDaysOfWeek: number[]; // 1 = Monday, 6 = Saturday, etc.
}

export interface Court {
  id: CourtId;
  name: string;
  type: string;
  surface: string;
  glass: string;
  lighting: string;
  pricePerSlot: number;
  featured?: boolean;
}

export type SlotStatus = 'available' | 'booked' | 'blocked' | 'my-booking';

export interface TimeSlot {
  id: string;
  time: string; // e.g. "18:00 - 19:30"
  startTime: string; // e.g. "18:00"
  endTime: string; // e.g. "19:30"
  courtId: CourtId;
  date: string; // "YYYY-MM-DD"
  status: SlotStatus;
  bookedBy?: {
    userName: string;
    userEmail: string;
    userPhone: string;
  };
  waitlistCount?: number;
}

export interface Booking {
  id: string;
  courtId: CourtId;
  courtName: string;
  date: string;
  timeSlot: string;
  startTime: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  price: number;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
  addBalls?: boolean;
  addRackets?: boolean;
  paymentNote?: string;
}

export interface WaitlistEntry {
  id: string;
  slotId: string;
  courtId: CourtId;
  courtName: string;
  date: string;
  timeSlot: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  createdAt: string;
  notified: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  category: string; // "4ta División", "6ta División", "Suma 11", "Mixto"
  startDate: string;
  endDate: string;
  prizes: string;
  pricePerCouple: number;
  totalSlots: number;
  registeredCouplesCount: number;
  status: 'inscripciones_abiertas' | 'en_curso' | 'finalizado';
  bannerImage?: string;
  bracket?: TournamentBracket;
}

export interface TournamentCouple {
  id: string;
  tournamentId: string;
  player1: string;
  player2: string;
  phone: string;
  email: string;
  rankingPoints?: number;
}

export interface MatchScore {
  set1?: string;
  set2?: string;
  set3?: string;
}

export interface BracketMatch {
  id: string;
  round: 'cuartos' | 'semifinal' | 'final';
  matchNumber: number;
  teamA: string;
  teamB: string;
  score?: MatchScore;
  winner?: 'A' | 'B';
  scheduledTime?: string;
}

export interface TournamentBracket {
  quarterFinals: BracketMatch[];
  semiFinals: BracketMatch[];
  finalMatch: BracketMatch;
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  rating: number;
  experienceYears: number;
}

export interface ClassPackage {
  id: string;
  title: string;
  durationMinutes: number;
  maxStudents: number;
  price: number;
  description: string;
  level: string;
  coachName?: string;
}

export interface ClassBooking {
  id: string;
  classPackageId: string;
  packageTitle: string;
  coachId: string;
  coachName: string;
  date: string;
  time: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  status: 'confirmed' | 'cancelled';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  category?: string;
  isAdmin?: boolean;
}

export type PushNotificationType = 
  | 'booking_confirmation'
  | 'turn_reminder'
  | 'tournament_update'
  | 'class_available'
  | 'waitlist_freed';

export interface AppNotification {
  id: string;
  type: PushNotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface PushPreferences {
  bookingConfirmations: boolean;
  turnReminders: boolean;
  tournamentUpdates: boolean;
  classAvailability: boolean;
  waitlistAlerts: boolean;
  soundEnabled: boolean;
}

