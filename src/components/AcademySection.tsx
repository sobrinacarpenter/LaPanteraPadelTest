import React, { useState, useEffect } from 'react';
import { GraduationCap, Star, Clock, Calendar, Check, Users, Sparkles, UserCheck, ShieldAlert, Award, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HEAD_COACH, CLUB_DETAILS } from '../data/mockData';
import { ClassPackage, ClassBooking, CoachScheduleConfig } from '../types';
import { StorageService } from '../services/storageService';

interface Props {
  refreshTrigger?: number;
}

export const AcademySection: React.FC<Props> = ({ refreshTrigger }) => {
  const [packages, setPackages] = useState<ClassPackage[]>(StorageService.getClassPackages());
  const [selectedPackage, setSelectedPackage] = useState<ClassPackage | null>(packages[0] || null);
  const [coachSchedule, setCoachSchedule] = useState<CoachScheduleConfig>(StorageService.getCoachSchedule());
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(1);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<ClassBooking | null>(null);

  // Sync schedule and packages from Storage
  const loadData = () => {
    const pkgs = StorageService.getClassPackages();
    const sched = StorageService.getCoachSchedule();
    setPackages(pkgs);
    setCoachSchedule(sched);

    setSelectedPackage((prev) => {
      if (!prev) return pkgs[0] || null;
      const found = pkgs.find(p => p.id === prev.id);
      return found || pkgs[0] || null;
    });

    if (sched.availableHours.length > 0 && !sched.availableHours.includes(selectedTime)) {
      setSelectedTime(sched.availableHours[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Compute days based on coach active days of week
  const coachDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx + 1);
    const dayOfWeek = d.getDay();
    const isActive = coachSchedule.activeDaysOfWeek.includes(dayOfWeek);
    return {
      offset: idx + 1,
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('es-AR', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('es-AR', { month: 'short' }),
      isActive,
    };
  }).filter(d => d.isActive).slice(0, 5);

  const currentUser = StorageService.getCurrentUser();
  const [studentName, setStudentName] = useState(currentUser.name);
  const [studentEmail, setStudentEmail] = useState(currentUser.email);
  const [studentPhone, setStudentPhone] = useState(currentUser.phone || '03385 43-0525');

  const handleBookClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    const dayObj = coachDays.find(d => d.offset === selectedDayOffset) || coachDays[0];
    if (!dayObj) return;

    const booking = StorageService.bookClass({
      packageId: selectedPackage.id,
      packageTitle: selectedPackage.title,
      coachId: HEAD_COACH.id,
      coachName: HEAD_COACH.name,
      date: dayObj.dateStr,
      time: selectedTime || coachSchedule.availableHours[0] || '18:00',
      studentName,
      studentEmail,
      studentPhone,
    });

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        colors: ['#ff007f', '#10b981', '#0f172a'],
      });
    } catch {}

    setBookingSuccess(booking);
  };

  return (
    <section id="academia" className="py-16 md:py-24 relative bg-slate-50 border-t border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 border border-pink-300 text-pink-700 text-xs font-bold uppercase mb-3">
            <GraduationCap className="w-4 h-4" />
            Academia Oficial La Pantera
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 uppercase tracking-tight">
            CLASES DE PÁDEL CON EL PROF. TOMÁS VILLEMUR
          </h2>
          <p className="text-base text-zinc-600 mt-2">
            Reserva tus entrenamientos directamente online sin necesidad de enviar mensajes de WhatsApp. Horarios sincronizados en tiempo real.
          </p>
        </div>

        {/* Coach Profile Card & Booking System Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Coach Bio & Photo */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative shrink-0">
                <img
                  src={HEAD_COACH.avatar}
                  alt={HEAD_COACH.name}
                  className="w-28 h-36 rounded-2xl object-cover ring-4 ring-pink-500/80 shadow-lg object-top"
                />
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-md uppercase">
                  Head Coach
                </span>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider block">
                  Profesor Titular
                </span>
                <h3 className="text-2xl font-black text-zinc-900 leading-tight">{HEAD_COACH.name}</h3>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{HEAD_COACH.rating} / 5.0</span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-600">{HEAD_COACH.experienceYears} años formando jugadores</span>
                </div>
                <div className="mt-2 text-xs font-medium text-zinc-600 flex items-center justify-center sm:justify-start gap-1">
                  <Phone className="w-3.5 h-3.5 text-pink-600" />
                  <span>{CLUB_DETAILS.phone}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              {HEAD_COACH.bio}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-zinc-200 space-y-2 text-xs">
              <span className="font-bold text-zinc-900 block">Metodología de Clase:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span>Bandeja y Víbora agresiva</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span>Táctica de Dobles</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span>Lectura del Cristal WPT</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span>Cesto de pelotas nuevas</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-xs text-pink-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-pink-600 shrink-0" />
              <span>Cancelación y reprogramación automatizada desde la web sin demoras.</span>
            </div>
          </div>

          {/* Right Column: Interactive Scheduling */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-6">
            
            {/* 1. Select Package */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">
                  1. Selecciona el Tipo de Clase ({packages.length})
                </label>
                <span className="text-[10px] text-pink-600 font-bold uppercase">Sincronizado</span>
              </div>

              {packages.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-zinc-200 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-zinc-600 font-bold">No hay clases configuradas actualmente.</p>
                  <p className="text-[11px] text-zinc-500">El profesor puede agregarlas desde el Panel de Administración.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-pink-50/50 border-pink-500 shadow-md ring-1 ring-pink-500'
                            : 'bg-slate-50 border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-black text-zinc-900 leading-tight">{pkg.title}</span>
                          <span className="text-xs font-black text-pink-600 shrink-0">${pkg.price.toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{pkg.description}</p>
                        <div className="mt-2 text-[10px] text-zinc-400 font-bold uppercase flex items-center justify-between">
                          <span>{pkg.durationMinutes} min • Máx {pkg.maxStudents} alumnos</span>
                          <span className="text-pink-600 lowercase">{pkg.level}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Select Date */}
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-2">
                2. Fecha Disponible (Agenda Sincronizada)
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {coachDays.map((d) => {
                  const isSelected = selectedDayOffset === d.offset;
                  return (
                    <button
                      key={d.offset}
                      onClick={() => setSelectedDayOffset(d.offset)}
                      className={`min-w-[70px] py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-pink-600 text-white border-pink-600 font-bold shadow-sm'
                          : 'bg-slate-50 border-zinc-200 text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      <span className="text-[10px] uppercase block font-semibold">{d.dayName}</span>
                      <span className="text-lg font-black">{d.dayNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Select Coach Available Time (Dynamic from Coach Schedule) */}
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-2">
                3. Horarios Disponibles del Prof. Tomás Villemur
              </label>
              
              {coachSchedule.availableHours.length === 0 ? (
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-zinc-500">
                  No hay horarios asignados en este momento.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {coachSchedule.availableHours.map((h) => {
                    const isSelected = selectedTime === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setSelectedTime(h)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-900 text-white font-black border-zinc-900 shadow-sm'
                            : 'bg-slate-50 border-zinc-200 text-zinc-800 hover:border-pink-500'
                        }`}
                      >
                        {h} hs
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Info Banner */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-950 font-black text-xs uppercase tracking-wide">
                  Pago directo al profesor
                </strong>
                <p className="text-[11px] text-emerald-800 leading-snug mt-0.5">
                  La clase se abona en la cancha el día de tu entrenamiento directamente con el <strong>Prof. Tomás Villemur</strong> (en efectivo o transferencia).
                </p>
              </div>
            </div>

            {/* 4. Student Data & Confirmation */}
            <form onSubmit={handleBookClass} className="pt-2 border-t border-zinc-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-700 uppercase">Alumno / Alumna</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-700 uppercase">Email (Google)</label>
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-700 uppercase">Teléfono WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedPackage}
                className="w-full py-3.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,0,127,0.35)] transition-all cursor-pointer disabled:opacity-50"
              >
                {selectedPackage
                  ? `Agendar Clase con Prof. Tomás Villemur ($${selectedPackage.price.toLocaleString()} ARS)`
                  : 'Selecciona una modalidad de clase arriba'}
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* Class Booking Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in zoom-in-95">
          <div className="w-full max-w-md bg-white border-2 border-pink-500 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <h3 className="text-xl font-black text-zinc-900 uppercase">¡Clase Agendada con Éxito!</h3>
            <p className="text-xs text-zinc-600 mt-1">El Prof. Tomás Villemur ya tiene tu horario registrado en cancha</p>

            <div className="my-4 p-4 rounded-xl bg-slate-50 border border-zinc-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Profesor:</span>
                <span className="font-bold text-zinc-900">{HEAD_COACH.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Modalidad:</span>
                <span className="font-bold text-zinc-900">{bookingSuccess.packageTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Fecha y Hora:</span>
                <span className="font-bold text-pink-600">{bookingSuccess.date} • {bookingSuccess.time} hs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Alumno:</span>
                <span className="text-zinc-900 font-semibold">{bookingSuccess.studentName}</span>
              </div>
            </div>

            <button
              onClick={() => setBookingSuccess(null)}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase"
            >
              Listo, nos vemos en la cancha
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
