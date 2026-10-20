import { Booking, ClassBooking, CoachScheduleConfig, CourtId, SlotStatus, TimeSlot, Tournament, TournamentCouple, UserProfile, WaitlistEntry, ClassPackage } from '../types';
import { COURTS, DEMO_USER, getFormattedDate, INITIAL_TOURNAMENTS, INITIAL_COACH_SCHEDULE, CLASS_PACKAGES, TIME_SLOT_HOURS } from '../data/mockData';
import { PushNotificationService } from './pushNotificationService';

const KEY_SLOTS = 'la_pantera_slots_prod_v1';
const KEY_BOOKINGS = 'la_pantera_bookings_prod_v1';
const KEY_WAITLIST = 'la_pantera_waitlist_prod_v1';
const KEY_USER = 'la_pantera_user_prod_v1';
const KEY_TOURNAMENTS = 'la_pantera_tournaments_prod_v1';
const KEY_COUPLES = 'la_pantera_couples_prod_v1';
const KEY_CLASS_BOOKINGS = 'la_pantera_class_bookings_prod_v1';
const KEY_CLASS_PACKAGES = 'la_pantera_class_packages_prod_v1';
const KEY_COACH_SCHEDULE = 'la_pantera_coach_schedule_prod_v1';
const KEY_COURT_PRICE = 'la_pantera_court_price_prod_v1';

// LIMITS
export const BOOKING_LIMITS = {
  MAX_PER_DAY_PER_USER: 2, // Max 2 turnos por día por jugador para evitar acaparamiento
  MAX_ACTIVE_PER_USER: 4,   // Max 4 turnos activos simultáneos en la semana
  MAX_TOURNAMENT_CATEGORIES_PER_PLAYER: 2, // Puede anotarse hasta en 2 categorías diferentes
};

export class StorageService {
  // Current user
  static getCurrentUser(): UserProfile {
    try {
      const data = localStorage.getItem(KEY_USER);
      return data ? JSON.parse(data) : DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  }

  static setCurrentUser(user: UserProfile) {
    localStorage.setItem(KEY_USER, JSON.stringify(user));
  }

  static toggleAdminRole(): boolean {
    const user = this.getCurrentUser();
    user.isAdmin = !user.isAdmin;
    this.setCurrentUser(user);
    return user.isAdmin;
  }

  // Court pricing
  static getCourtPrice(): number {
    try {
      const val = localStorage.getItem(KEY_COURT_PRICE);
      return val ? parseInt(val, 10) : COURTS[0].pricePerSlot;
    } catch {
      return COURTS[0].pricePerSlot;
    }
  }

  static setCourtPrice(price: number) {
    localStorage.setItem(KEY_COURT_PRICE, price.toString());
  }

  // Get slots for date - Clean starting state: ALL SLOTS AVAILABLE
  static getSlotsForDate(date: string): TimeSlot[] {
    try {
      const allSlotsRaw = localStorage.getItem(KEY_SLOTS);
      const allSlots: Record<string, TimeSlot[]> = allSlotsRaw ? JSON.parse(allSlotsRaw) : {};

      if (allSlots[date] && allSlots[date].length > 0) {
        return allSlots[date];
      }

      // Generate default schedule for this date (All available by default)
      const generated: TimeSlot[] = [];
      const court = COURTS[0];

      TIME_SLOT_HOURS.forEach((h) => {
        generated.push({
          id: `slot_${court.id}_${date}_${h.start.replace(':', '')}`,
          courtId: court.id,
          date,
          time: h.time,
          startTime: h.start,
          endTime: h.end,
          status: 'available',
          waitlistCount: 0,
        });
      });

      allSlots[date] = generated;
      localStorage.setItem(KEY_SLOTS, JSON.stringify(allSlots));
      return generated;
    } catch {
      return [];
    }
  }

  static saveSlotsForDate(date: string, slots: TimeSlot[]) {
    try {
      const allSlotsRaw = localStorage.getItem(KEY_SLOTS);
      const allSlots: Record<string, TimeSlot[]> = allSlotsRaw ? JSON.parse(allSlotsRaw) : {};
      allSlots[date] = slots;
      localStorage.setItem(KEY_SLOTS, JSON.stringify(allSlots));
    } catch (e) {
      console.error(e);
    }
  }

  // Validate limits before booking
  static validateBookingLimits(userEmail: string, date: string): { allowed: boolean; reason?: string } {
    const allBookings = this.getBookings().filter(b => b.status === 'confirmed');
    
    // Check bookings on this specific date by email
    const userBookingsSameDay = allBookings.filter(b => b.userEmail.toLowerCase() === userEmail.toLowerCase() && b.date === date);
    if (userBookingsSameDay.length >= BOOKING_LIMITS.MAX_PER_DAY_PER_USER) {
      return {
        allowed: false,
        reason: `Has alcanzado el límite de ${BOOKING_LIMITS.MAX_PER_DAY_PER_USER} turnos para el día ${date}. Este límite garantiza la disponibilidad de la cancha para todos los socios.`,
      };
    }

    // Check total active bookings
    const userTotalActive = allBookings.filter(b => b.userEmail.toLowerCase() === userEmail.toLowerCase());
    if (userTotalActive.length >= BOOKING_LIMITS.MAX_ACTIVE_PER_USER) {
      return {
        allowed: false,
        reason: `Tienes ${userTotalActive.length} turnos activos. El límite máximo es de ${BOOKING_LIMITS.MAX_ACTIVE_PER_USER} turnos simultáneos por jugador.`,
      };
    }

    return { allowed: true };
  }

  // Create booking
  static createBooking(params: {
    slotId: string;
    courtId: CourtId;
    courtName: string;
    date: string;
    timeSlot: string;
    startTime: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    price: number;
    bypassLimits?: boolean;
  }): { success: boolean; booking?: Booking; error?: string } {
    // Limit check
    if (!params.bypassLimits) {
      const check = this.validateBookingLimits(params.userEmail, params.date);
      if (!check.allowed) {
        return { success: false, error: check.reason };
      }
    }

    const booking: Booking = {
      id: 'book_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      courtId: params.courtId,
      courtName: params.courtName,
      date: params.date,
      timeSlot: params.timeSlot,
      startTime: params.startTime,
      userName: params.userName,
      userEmail: params.userEmail,
      userPhone: params.userPhone,
      price: params.price,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    // Update slot
    const slots = this.getSlotsForDate(params.date);
    const updatedSlots = slots.map(s => {
      if (s.id === params.slotId || (s.courtId === params.courtId && s.time === params.timeSlot)) {
        return {
          ...s,
          status: 'booked' as const,
          bookedBy: {
            userName: params.userName,
            userEmail: params.userEmail,
            userPhone: params.userPhone,
          },
        };
      }
      return s;
    });
    this.saveSlotsForDate(params.date, updatedSlots);

    // Save to user bookings
    const currentBookings = this.getBookings();
    localStorage.setItem(KEY_BOOKINGS, JSON.stringify([booking, ...currentBookings]));

    PushNotificationService.notifyBookingConfirmed(params.courtName, params.date, params.timeSlot);

    return { success: true, booking };
  }

  static getBookings(): Booking[] {
    try {
      const data = localStorage.getItem(KEY_BOOKINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Cancel booking
  static cancelBooking(bookingId: string): { success: boolean; freedSlot?: { courtId: CourtId; date: string; timeSlot: string } } {
    const bookings = this.getBookings();
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return { success: false };

    const updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b);
    localStorage.setItem(KEY_BOOKINGS, JSON.stringify(updatedBookings));

    // Free slot
    const slots = this.getSlotsForDate(targetBooking.date);
    const updatedSlots = slots.map(s => {
      if (s.courtId === targetBooking.courtId && s.time === targetBooking.timeSlot) {
        return {
          ...s,
          status: 'available' as const,
          bookedBy: undefined,
        };
      }
      return s;
    });
    this.saveSlotsForDate(targetBooking.date, updatedSlots);

    // Notify waitlist
    this.notifyWaitlistForSlot(targetBooking.courtId, targetBooking.date, targetBooking.timeSlot, targetBooking.courtName);

    return {
      success: true,
      freedSlot: {
        courtId: targetBooking.courtId,
        date: targetBooking.date,
        timeSlot: targetBooking.timeSlot,
      },
    };
  }

  // Waitlist
  static joinWaitlist(params: {
    slotId: string;
    courtId: CourtId;
    courtName: string;
    date: string;
    timeSlot: string;
    userName: string;
    userEmail: string;
    userPhone: string;
  }): WaitlistEntry {
    const entry: WaitlistEntry = {
      id: 'wl_' + Date.now(),
      slotId: params.slotId,
      courtId: params.courtId,
      courtName: params.courtName,
      date: params.date,
      timeSlot: params.timeSlot,
      userName: params.userName,
      userEmail: params.userEmail,
      userPhone: params.userPhone,
      createdAt: new Date().toISOString(),
      notified: false,
    };

    const waitlist = this.getWaitlist();
    localStorage.setItem(KEY_WAITLIST, JSON.stringify([...waitlist, entry]));

    const slots = this.getSlotsForDate(params.date);
    const updated = slots.map(s => {
      if (s.id === params.slotId) {
        return { ...s, waitlistCount: (s.waitlistCount || 0) + 1 };
      }
      return s;
    });
    this.saveSlotsForDate(params.date, updated);

    PushNotificationService.dispatchNotification({
      type: 'waitlist_freed',
      title: '🎯 En Lista de Espera',
      body: `Te avisaremos apenas se libere el turno de las ${params.timeSlot} en ${params.courtName}.`,
    });

    return entry;
  }

  static getWaitlist(): WaitlistEntry[] {
    try {
      const data = localStorage.getItem(KEY_WAITLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static notifyWaitlistForSlot(courtId: CourtId, date: string, timeSlot: string, courtName: string) {
    const waitlist = this.getWaitlist();
    const interested = waitlist.filter(w => w.courtId === courtId && w.date === date && w.timeSlot === timeSlot && !w.notified);

    if (interested.length > 0) {
      const updated = waitlist.map(w => {
        if (w.courtId === courtId && w.date === date && w.timeSlot === timeSlot) {
          return { ...w, notified: true };
        }
        return w;
      });
      localStorage.setItem(KEY_WAITLIST, JSON.stringify(updated));

      PushNotificationService.notifyWaitlistFreed(courtName, date, timeSlot);
    }
  }

  // Admin slot lock/unlock
  static toggleSlotBlock(slotId: string, date: string, reason?: string): SlotStatus {
    const slots = this.getSlotsForDate(date);
    let newStatus: SlotStatus = 'available';

    const updated = slots.map(s => {
      if (s.id === slotId) {
        newStatus = s.status === 'blocked' ? 'available' : 'blocked';
        return {
          ...s,
          status: newStatus,
          bookedBy: newStatus === 'blocked' ? {
            userName: reason || 'Bloqueo Administración / Club',
            userEmail: 'admin@lapanterapadel.com.ar',
            userPhone: '03385 43-0525',
          } : undefined,
        };
      }
      return s;
    });

    this.saveSlotsForDate(date, updated);
    return newStatus;
  }

  // ==========================================
  // TOURNAMENTS MANAGEMENT
  // ==========================================
  static getTournaments(): Tournament[] {
    try {
      const data = localStorage.getItem(KEY_TOURNAMENTS);
      return data ? JSON.parse(data) : INITIAL_TOURNAMENTS;
    } catch {
      return INITIAL_TOURNAMENTS;
    }
  }

  static saveTournaments(list: Tournament[]) {
    localStorage.setItem(KEY_TOURNAMENTS, JSON.stringify(list));
  }

  static createTournament(params: {
    name: string;
    category: string;
    startDate: string;
    endDate: string;
    prizes: string;
    pricePerCouple: number;
    totalSlots: number;
  }): Tournament {
    const newTournament: Tournament = {
      id: 'torneo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: params.name,
      category: params.category,
      startDate: params.startDate,
      endDate: params.endDate,
      prizes: params.prizes,
      pricePerCouple: params.pricePerCouple,
      totalSlots: params.totalSlots,
      registeredCouplesCount: 0,
      status: 'inscripciones_abiertas',
    };

    const current = this.getTournaments();
    const updated = [newTournament, ...current];
    this.saveTournaments(updated);

    PushNotificationService.notifyTournamentUpdate(
      '¡Nuevo Torneo Abierto! 🏆',
      `${params.name} (${params.category}) - ${params.prizes}. ¡Inscripciones abiertas!`
    );

    return newTournament;
  }

  // Reliable tournament deletion
  static deleteTournament(id: string): boolean {
    const current = this.getTournaments();
    const filtered = current.filter(t => t.id !== id);
    this.saveTournaments(filtered);

    // Also remove associated registered couples
    const couples = this.getTournamentCouples();
    const filteredCouples = couples.filter(c => c.tournamentId !== id);
    localStorage.setItem(KEY_COUPLES, JSON.stringify(filteredCouples));

    return true;
  }

  static updateTournamentStatus(id: string, status: 'inscripciones_abiertas' | 'en_curso' | 'finalizado') {
    const current = this.getTournaments();
    const updated = current.map(t => t.id === id ? { ...t, status } : t);
    this.saveTournaments(updated);
  }

  // Register couple with multiple categories allowed & duplicate protection
  static registerTournamentCouple(params: {
    tournamentId: string;
    player1: string;
    player2: string;
    phone: string;
    email: string;
  }): { success: boolean; couple?: TournamentCouple; error?: string } {
    const tournaments = this.getTournaments();
    const targetTournament = tournaments.find(t => t.id === params.tournamentId);
    if (!targetTournament) return { success: false, error: 'Torneo no encontrado' };

    if (targetTournament.registeredCouplesCount >= targetTournament.totalSlots) {
      return { success: false, error: 'Los cupos para este torneo están completos.' };
    }

    const allCouples = this.getTournamentCouples();

    // Check if the exact same couple is already in this exact tournament
    const isDuplicateExact = allCouples.some(
      c => c.tournamentId === params.tournamentId &&
      c.player1.toLowerCase().trim() === params.player1.toLowerCase().trim() &&
      c.player2.toLowerCase().trim() === params.player2.toLowerCase().trim()
    );
    if (isDuplicateExact) {
      return { success: false, error: `La pareja ${params.player1} y ${params.player2} ya se encuentra registrada en este torneo.` };
    }

    // Check player category limit (max 2 categories per player)
    const p1Registrations = allCouples.filter(c => c.player1.toLowerCase().trim() === params.player1.toLowerCase().trim() || c.player2.toLowerCase().trim() === params.player1.toLowerCase().trim());
    if (p1Registrations.length >= BOOKING_LIMITS.MAX_TOURNAMENT_CATEGORIES_PER_PLAYER) {
      return { success: false, error: `${params.player1} ya está inscripto en ${BOOKING_LIMITS.MAX_TOURNAMENT_CATEGORIES_PER_PLAYER} categorías (límite máximo permitido para no superponer partidos).` };
    }

    const couple: TournamentCouple = {
      id: 'couple_' + Date.now(),
      tournamentId: params.tournamentId,
      player1: params.player1,
      player2: params.player2,
      phone: params.phone,
      email: params.email,
    };

    localStorage.setItem(KEY_COUPLES, JSON.stringify([...allCouples, couple]));

    const updatedTournaments = tournaments.map(t => {
      if (t.id === params.tournamentId) {
        return {
          ...t,
          registeredCouplesCount: Math.min(t.totalSlots, t.registeredCouplesCount + 1),
        };
      }
      return t;
    });
    this.saveTournaments(updatedTournaments);

    PushNotificationService.notifyTournamentUpdate(
      'Inscripción a Torneo Confirmada',
      `Pareja ${params.player1} & ${params.player2} inscripta con éxito en ${targetTournament.name}.`
    );

    return { success: true, couple };
  }

  static getTournamentCouples(): TournamentCouple[] {
    try {
      const data = localStorage.getItem(KEY_COUPLES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // ==========================================
  // COACH SCHEDULE & CLASSES (TOMÁS VILLEMUR)
  // ==========================================
  static getCoachSchedule(): CoachScheduleConfig {
    try {
      const data = localStorage.getItem(KEY_COACH_SCHEDULE);
      return data ? JSON.parse(data) : INITIAL_COACH_SCHEDULE;
    } catch {
      return INITIAL_COACH_SCHEDULE;
    }
  }

  static saveCoachSchedule(config: CoachScheduleConfig) {
    localStorage.setItem(KEY_COACH_SCHEDULE, JSON.stringify(config));
  }

  static addCoachHour(hour: string): CoachScheduleConfig {
    const config = this.getCoachSchedule();
    if (!config.availableHours.includes(hour)) {
      config.availableHours = [...config.availableHours, hour].sort();
      this.saveCoachSchedule(config);
      PushNotificationService.notifyClassAvailable('Prof. Tomás Villemur', 'Próximas fechas', hour);
    }
    return config;
  }

  static removeCoachHour(hour: string): CoachScheduleConfig {
    const config = this.getCoachSchedule();
    config.availableHours = config.availableHours.filter(h => h !== hour);
    this.saveCoachSchedule(config);
    return config;
  }

  static toggleCoachDay(dayNumber: number): CoachScheduleConfig {
    const config = this.getCoachSchedule();
    if (config.activeDaysOfWeek.includes(dayNumber)) {
      config.activeDaysOfWeek = config.activeDaysOfWeek.filter(d => d !== dayNumber);
    } else {
      config.activeDaysOfWeek = [...config.activeDaysOfWeek, dayNumber].sort();
    }
    this.saveCoachSchedule(config);
    return config;
  }

  // ==========================================
  // CLASS PACKAGES / TIPOS DE CLASES (ACADEMIA)
  // ==========================================
  static getClassPackages(): ClassPackage[] {
    try {
      const data = localStorage.getItem(KEY_CLASS_PACKAGES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Initialize with default packages
      localStorage.setItem(KEY_CLASS_PACKAGES, JSON.stringify(CLASS_PACKAGES));
      return CLASS_PACKAGES;
    } catch {
      return CLASS_PACKAGES;
    }
  }

  static saveClassPackages(packages: ClassPackage[]) {
    localStorage.setItem(KEY_CLASS_PACKAGES, JSON.stringify(packages));
  }

  static addClassPackage(params: {
    title: string;
    durationMinutes: number;
    maxStudents: number;
    price: number;
    description: string;
    level: string;
    coachName?: string;
  }): ClassPackage {
    const packages = this.getClassPackages();
    const newPkg: ClassPackage = {
      id: 'pkg_' + Date.now(),
      title: params.title,
      durationMinutes: params.durationMinutes,
      maxStudents: params.maxStudents,
      price: params.price,
      description: params.description,
      level: params.level,
      coachName: params.coachName || 'Prof. Tomás Villemur',
    };
    const updated = [...packages, newPkg];
    this.saveClassPackages(updated);
    return newPkg;
  }

  static deleteClassPackage(packageId: string): boolean {
    const packages = this.getClassPackages();
    const filtered = packages.filter(p => p.id !== packageId);
    this.saveClassPackages(filtered);
    return true;
  }

  static updateClassPackage(packageId: string, updatedFields: Partial<ClassPackage>): ClassPackage | null {
    const packages = this.getClassPackages();
    let updatedPkg: ClassPackage | null = null;
    const updated = packages.map(p => {
      if (p.id === packageId) {
        updatedPkg = { ...p, ...updatedFields };
        return updatedPkg;
      }
      return p;
    });
    this.saveClassPackages(updated);
    return updatedPkg;
  }

  // Classes
  static bookClass(params: {
    packageId: string;
    packageTitle: string;
    coachId: string;
    coachName: string;
    date: string;
    time: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
  }): ClassBooking {
    const booking: ClassBooking = {
      id: 'class_book_' + Date.now(),
      classPackageId: params.packageId,
      packageTitle: params.packageTitle,
      coachId: params.coachId,
      coachName: params.coachName,
      date: params.date,
      time: params.time,
      studentName: params.studentName,
      studentEmail: params.studentEmail,
      studentPhone: params.studentPhone,
      status: 'confirmed',
    };

    const list = this.getClassBookings();
    localStorage.setItem(KEY_CLASS_BOOKINGS, JSON.stringify([booking, ...list]));

    PushNotificationService.notifyClassAvailable(
      params.coachName,
      params.date,
      params.time
    );

    return booking;
  }

  static getClassBookings(): ClassBooking[] {
    try {
      const data = localStorage.getItem(KEY_CLASS_BOOKINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static cancelClassBooking(bookingId: string) {
    const list = this.getClassBookings();
    const updated = list.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b);
    localStorage.setItem(KEY_CLASS_BOOKINGS, JSON.stringify(updated));
  }

  // ==========================================
  // ADMIN SIMULATION TOOLS
  // ==========================================
  // Simular un turno ocupado (para probar la lista de espera)
  static simulateOccupiedSlot(date: string, timeSlot: string) {
    const slots = this.getSlotsForDate(date);
    const updated = slots.map(s => {
      if (s.time === timeSlot) {
        return {
          ...s,
          status: 'booked' as const,
          bookedBy: {
            userName: 'Gonzalo Rossi (Simulado)',
            userEmail: 'gonzalo@jovita.com',
            userPhone: '03385 43-0525',
          },
          waitlistCount: 1,
        };
      }
      return s;
    });
    this.saveSlotsForDate(date, updated);
  }

  // Simular cancelación (para probar que salte el aviso a la lista de espera)
  static simulateCancellation(date: string, timeSlot: string) {
    const court = COURTS[0];
    const slots = this.getSlotsForDate(date);
    const updated = slots.map(s => {
      if (s.time === timeSlot) {
        return {
          ...s,
          status: 'available' as const,
          bookedBy: undefined,
        };
      }
      return s;
    });
    this.saveSlotsForDate(date, updated);
    this.notifyWaitlistForSlot(court.id, date, timeSlot, court.name);
  }

  // Simular parejas de torneo
  static simulateTournamentCouples(tournamentId: string) {
    const sampleCouples = [
      { p1: 'Federico Acosta', p2: 'Martín López' },
      { p1: 'Lucas Díaz', p2: 'Santiago Pereyra' },
      { p1: 'Ezequiel Morales', p2: 'Rodrigo Suárez' },
      { p1: 'Nicolás Funes', p2: 'Cristian Gómez' },
    ];

    sampleCouples.forEach(c => {
      this.registerTournamentCouple({
        tournamentId,
        player1: c.p1,
        player2: c.p2,
        phone: '03385 43-0525',
        email: 'jugador@jovita.com',
      });
    });
  }

  // Reset all to clean production slate
  static resetAllData() {
    localStorage.removeItem(KEY_SLOTS);
    localStorage.removeItem(KEY_BOOKINGS);
    localStorage.removeItem(KEY_WAITLIST);
    localStorage.removeItem(KEY_COUPLES);
    localStorage.removeItem(KEY_CLASS_BOOKINGS);
    localStorage.setItem(KEY_CLASS_PACKAGES, JSON.stringify(CLASS_PACKAGES));
    localStorage.setItem(KEY_COACH_SCHEDULE, JSON.stringify(INITIAL_COACH_SCHEDULE));
    localStorage.setItem(KEY_TOURNAMENTS, JSON.stringify(INITIAL_TOURNAMENTS));
  }
}
