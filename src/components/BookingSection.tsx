import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Zap, Check, AlertCircle, Sparkles, Filter, ChevronRight, Share2, BellRing, Info, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Court, CourtId, SlotStatus, TimeSlot } from '../types';
import { COURTS, getFormattedDate } from '../data/mockData';
import { StorageService } from '../services/storageService';
import { PushNotificationService } from '../services/pushNotificationService';

interface Props {
  onBookingSuccess?: () => void;
  onOpenMyBookings?: () => void;
}

export const BookingSection: React.FC<Props> = ({ onBookingSuccess, onOpenMyBookings }) => {
  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es-AR', { weekday: 'short' });
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString('es-AR', { month: 'short' });
    return { dateStr, dayName, dayNumber, monthName };
  });

  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].dateStr);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const courtPrice = StorageService.getCourtPrice();
  
  // Modals
  const [activeSlotToBook, setActiveSlotToBook] = useState<TimeSlot | null>(null);
  const [activeSlotForWaitlist, setActiveSlotForWaitlist] = useState<TimeSlot | null>(null);
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState<any | null>(null);
  const [limitErrorMessage, setLimitErrorMessage] = useState<string | null>(null);

  // Extras and payment preferences
  const [addBalls, setAddBalls] = useState(false);
  const [addRackets, setAddRackets] = useState(false);
  const [needPlayers, setNeedPlayers] = useState(false);

  // Form State
  const currentUser = StorageService.getCurrentUser();
  const [playerName, setPlayerName] = useState(currentUser.name);
  const [playerEmail, setPlayerEmail] = useState(currentUser.email);
  const [playerPhone, setPlayerPhone] = useState(currentUser.phone || '03385 43-0525');

  const loadSlots = () => {
    const list = StorageService.getSlotsForDate(selectedDate);
    setSlots(list);
  };

  useEffect(() => {
    loadSlots();
  }, [selectedDate]);

  // Execute Booking
  const handleConfirmBooking = () => {
    if (!activeSlotToBook) return;

    const court = COURTS[0];
    const result = StorageService.createBooking({
      slotId: activeSlotToBook.id,
      courtId: activeSlotToBook.courtId,
      courtName: court.name,
      date: activeSlotToBook.date,
      timeSlot: activeSlotToBook.time,
      startTime: activeSlotToBook.startTime,
      userName: playerName || 'Jugador Pantera',
      userEmail: playerEmail || 'tisianovera.4@gmail.com',
      userPhone: playerPhone || '03385 43-0525',
      price: courtPrice,
    });

    if (!result.success) {
      setLimitErrorMessage(result.error || 'No se pudo completar la reserva debido a los límites del club.');
      return;
    }

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ff007f', '#0f172a', '#ec4899'],
      });
    } catch (e) {}

    setConfirmedBookingDetails(result.booking);
    setActiveSlotToBook(null);
    setLimitErrorMessage(null);
    loadSlots();
    onBookingSuccess?.();
  };

  // Join Waitlist
  const handleConfirmWaitlist = () => {
    if (!activeSlotForWaitlist) return;

    const court = COURTS[0];
    StorageService.joinWaitlist({
      slotId: activeSlotForWaitlist.id,
      courtId: activeSlotForWaitlist.courtId,
      courtName: court.name,
      date: activeSlotForWaitlist.date,
      timeSlot: activeSlotForWaitlist.time,
      userName: playerName,
      userEmail: playerEmail,
      userPhone: playerPhone,
    });

    setActiveSlotForWaitlist(null);
    loadSlots();
  };

  const court = COURTS[0];
  const pricePerPlayer = Math.round(courtPrice / 4);

  return (
    <section id="reservas" className="py-8 md:py-16 relative bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Simplified Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-zinc-100 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-pink-600 fill-current" />
              Turnos de la Cancha
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              ${courtPrice.toLocaleString()} por turno (90 min) • <strong>${pricePerPlayer.toLocaleString()} por jugador</strong>
            </p>
          </div>

          <button
            onClick={onOpenMyBookings}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-zinc-800 flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <span>Mis Turnos Reservados</span>
            <ChevronRight className="w-4 h-4 text-pink-600" />
          </button>
        </div>

        {/* 1. Date Selector Carousel - Touch friendly */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
            {dateOptions.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`min-w-[76px] sm:min-w-[96px] py-2.5 sm:py-3 px-2 rounded-2xl border text-center transition-all snap-start cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-pink-600 text-white border-pink-600 shadow-md scale-[1.02]'
                      : 'bg-slate-50 border-zinc-200 text-zinc-600 hover:border-pink-300 hover:text-zinc-900'
                  }`}
                >
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{item.dayName}</span>
                  <span className="text-xl sm:text-2xl font-black leading-tight">{item.dayNumber}</span>
                  <span className="text-[9px] uppercase font-semibold opacity-90">{item.monthName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Legend & Court Status */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 text-xs sm:text-sm">Horarios para {selectedDate}:</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Libre</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
              <span>Ocupado (con lista de espera)</span>
            </div>
          </div>
        </div>

        {/* 3. Time Slots Grid - Optimized Responsive Sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {slots.map((slot) => {
            const isAvailable = slot.status === 'available';
            const isBooked = slot.status === 'booked';
            const isBlocked = slot.status === 'blocked';

            return (
              <div
                key={slot.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isAvailable
                    ? 'bg-white border-zinc-200 hover:border-pink-500 hover:shadow-md shadow-xs'
                    : isBlocked
                    ? 'bg-slate-100 border-zinc-200 opacity-60'
                    : 'bg-slate-50 border-zinc-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Turno 90 min
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : isBlocked
                        ? 'bg-zinc-200 text-zinc-700'
                        : 'bg-slate-200 text-zinc-700'
                    }`}>
                      {isAvailable ? 'Disponible' : isBlocked ? 'Bloqueado' : 'Ocupado'}
                    </span>
                  </div>

                  {/* Main Time Display */}
                  <div className="text-lg sm:text-xl font-black text-zinc-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pink-600 shrink-0" />
                    <span>{slot.time}</span>
                  </div>

                  <p className="text-[11px] text-zinc-500 mt-1">
                    ${pricePerPlayer.toLocaleString()} por jugador
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="mt-3.5 pt-2.5 border-t border-zinc-100">
                  {isAvailable && (
                    <button
                      onClick={() => {
                        setLimitErrorMessage(null);
                        setActiveSlotToBook(slot);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Reservar
                    </button>
                  )}

                  {isBooked && (
                    <button
                      onClick={() => setActiveSlotForWaitlist(slot)}
                      className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-zinc-300 hover:border-pink-400 text-pink-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      Avisarme si se libera
                      {slot.waitlistCount ? (
                        <span className="text-[10px] text-zinc-400">({slot.waitlistCount})</span>
                      ) : null}
                    </button>
                  )}

                  {isBlocked && (
                    <div className="text-center py-2 text-xs text-zinc-400 font-medium">
                      Bloqueado por el Club
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL 1: Confirm Booking */}
      {activeSlotToBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border-2 border-pink-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-600 animate-ping" />
                <h3 className="text-base sm:text-lg font-black text-zinc-900 uppercase">Confirmar Turno</h3>
              </div>
              <button onClick={() => setActiveSlotToBook(null)} className="text-zinc-400 hover:text-zinc-700 text-lg">✕</button>
            </div>

            {limitErrorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{limitErrorMessage}</span>
              </div>
            )}

            <div className="py-3 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-zinc-200">
                <div className="text-[11px] text-zinc-500">Cancha Oficial</div>
                <div className="text-sm font-black text-zinc-900">{court.name}</div>
                <div className="text-xs text-pink-600 font-bold">{activeSlotToBook.date} • {activeSlotToBook.time} (90 min)</div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3 rounded-xl bg-slate-50 border border-zinc-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Total Cancha</span>
                  <span className="text-base font-black text-zinc-900">${courtPrice.toLocaleString()} ARS</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500 block text-[11px]">4 Jugadores</span>
                  <span className="text-pink-600 font-bold">
                    ${pricePerPlayer.toLocaleString()} c/u
                  </span>
                </div>
              </div>

              {/* Payment Notice Banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-black text-xs text-emerald-900 uppercase tracking-wide">
                    Pago en el Club Después de Jugar
                  </strong>
                  <p className="text-[11px] text-emerald-800 leading-snug mt-0.5">
                    No necesitas pagar ahora ni ingresar tarjeta. <strong>El turno se abona después de jugar</strong> directamente en el club con la persona que esté atendiendo en ese momento (en efectivo o transferencia al alias del club).
                  </p>
                </div>
              </div>

              {/* Player details */}
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase">Nombre del Titular</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                    placeholder="Tu nombre y apellido"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase">Email (Google / Gmail)</label>
                  <input
                    type="email"
                    value={playerEmail}
                    onChange={(e) => setPlayerEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                    placeholder="tu.email@gmail.com"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase">Teléfono WhatsApp</label>
                  <input
                    type="tel"
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                    placeholder="03385 43-0525"
                  />
                </div>
              </div>

              {/* Optional extras & Community feature */}
              <div className="p-3 bg-slate-50 border border-zinc-200 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-zinc-700 block text-[10px] uppercase tracking-wider">
                  Servicios Adicionales (Opcional - Se pagan en el club)
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 text-xs">
                  <input
                    type="checkbox"
                    checked={addBalls}
                    onChange={(e) => setAddBalls(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span>🎾 Tubo de 3 pelotas nuevas (+ $5.000)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 text-xs">
                  <input
                    type="checkbox"
                    checked={addRackets}
                    onChange={(e) => setAddRackets(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span>🏓 Alquiler de paletas (+ $2.000 c/u)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-pink-700 font-medium text-xs pt-1 border-t border-zinc-200">
                  <input
                    type="checkbox"
                    checked={needPlayers}
                    onChange={(e) => setNeedPlayers(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span>👥 ¿Les falta 1 o 2 jugadores? (Avisar para completar el partido)</span>
                </label>
              </div>

              <p className="text-[10px] text-zinc-500 text-center pt-1">
                Límite: Máximo 2 turnos por día por jugador para garantizar la rotación de la cancha.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveSlotToBook(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-700 font-bold text-xs"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-2 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Waitlist Modal */}
      {activeSlotForWaitlist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border-2 border-pink-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-pink-600" />
                <h3 className="text-base font-black text-zinc-900 uppercase">Lista de Espera Inteligente</h3>
              </div>
              <button onClick={() => setActiveSlotForWaitlist(null)} className="text-zinc-400 hover:text-zinc-700">✕</button>
            </div>

            <div className="py-3 space-y-3">
              <p className="text-xs text-zinc-600 leading-relaxed">
                El turno de las <strong className="text-zinc-900">{activeSlotForWaitlist.time}</strong> está reservado actualmente.
              </p>
              
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-xs text-pink-900">
                ⚡ <strong>Aviso Automático:</strong> Si el titular cancela su turno desde su perfil, la cancha se libera y recibirás una <span className="underline font-bold">Notificación Push al instante</span> en tu celular.
              </div>

              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase">Tu Email</label>
                  <input
                    type="email"
                    value={playerEmail}
                    onChange={(e) => setPlayerEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase">Tu Teléfono</label>
                  <input
                    type="tel"
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveSlotForWaitlist(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-zinc-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmWaitlist}
                className="flex-2 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase shadow-md cursor-pointer"
              >
                Anotarme en la Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Booking Success Card */}
      {confirmedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in-95">
          <div className="w-full max-w-md bg-white border-2 border-pink-500 rounded-3xl p-5 sm:p-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-pink-100 border-2 border-pink-500 text-pink-600 mx-auto flex items-center justify-center mb-3">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-tight">¡TURNO CONFIRMADO!</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Cancha reservada con éxito en La Pantera Padel</p>

            <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-zinc-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Cancha:</span>
                <span className="font-bold text-zinc-900">{confirmedBookingDetails.courtName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Fecha & Horario:</span>
                <span className="font-bold text-pink-600">{confirmedBookingDetails.date} • {confirmedBookingDetails.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Titular:</span>
                <span className="font-semibold text-zinc-900">{confirmedBookingDetails.userName}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2">
                <span className="text-zinc-500">Total a abonar en el club:</span>
                <span className="font-black text-pink-600 text-sm">${confirmedBookingDetails.price.toLocaleString()} ARS</span>
              </div>
            </div>

            {/* Clear Payment Instructions */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-left text-xs text-emerald-950 flex items-start gap-2.5 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black text-emerald-900 uppercase tracking-wide text-[11px]">
                  El turno se abona después de jugar
                </strong>
                <p className="text-[11px] text-emerald-800 leading-snug mt-0.5">
                  Pagas directamente en el club con la persona que te atienda en ese momento (en efectivo o transferencia al alias del club). ¡No te preocupes por nada previo!
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 mb-4">
              Hemos enviado una notificación a tu celular. Si necesitas cancelar, hazlo desde <strong>Mis Turnos</strong> para liberar la cancha automáticamente.
            </p>

            <button
              onClick={() => setConfirmedBookingDetails(null)}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase cursor-pointer"
            >
              Listo, muchas gracias
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
