import React, { useState, useEffect } from 'react';
import { Shield, Lock, Unlock, Users, Bell, Trophy, DollarSign, Calendar, AlertTriangle, Send, Check, Trash2, Plus, Clock, Edit2, Sparkles, X, RefreshCw, Play, CheckCircle, Copy, FileText, ChevronDown, Award, GraduationCap } from 'lucide-react';
import { TimeSlot, Tournament, WaitlistEntry, PADEL_CATEGORIES, CoachScheduleConfig, Booking, ClassPackage, ClassBooking } from '../types';
import { COURTS, getFormattedDate, HEAD_COACH } from '../data/mockData';
import { StorageService } from '../services/storageService';
import { PushNotificationService } from '../services/pushNotificationService';

interface Props {
  onClose: () => void;
  onRefreshData?: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onClose, onRefreshData }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getFormattedDate(0));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [coachSchedule, setCoachSchedule] = useState<CoachScheduleConfig>(StorageService.getCoachSchedule());
  const [classPackages, setClassPackages] = useState<ClassPackage[]>(StorageService.getClassPackages());
  const [classBookings, setClassBookings] = useState<ClassBooking[]>(StorageService.getClassBookings());
  const [courtPrice, setCourtPrice] = useState<number>(StorageService.getCourtPrice());
  const [activeTab, setActiveTab] = useState<'tournaments' | 'slots' | 'coach_classes' | 'bookings' | 'simulations' | 'broadcast'>('tournaments');

  // New Tournament Form State
  const [isCreatingTournament, setIsCreatingTournament] = useState(false);
  const [newTourneyName, setNewTourneyName] = useState('');
  const [newTourneyCategory, setNewTourneyCategory] = useState<string>(PADEL_CATEGORIES[4]); // 5ta
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryText, setCustomCategoryText] = useState('');
  const [newTourneyStartDate, setNewTourneyStartDate] = useState('24 Oct 2026');
  const [newTourneyEndDate, setNewTourneyEndDate] = useState('26 Oct 2026');
  const [newTourneyPrizes, setNewTourneyPrizes] = useState('$350.000 en Premios + Indumentaria Oficial');
  const [newTourneyPrice, setNewTourneyPrice] = useState(20000);
  const [newTourneySlots, setNewTourneySlots] = useState(16);

  // Tournament inline confirm delete state (100% reliable)
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [inlineConfirmTourneyId, setInlineConfirmTourneyId] = useState<string | null>(null);

  // New Class Package Form State
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassTitle, setNewClassTitle] = useState('');
  const [newClassPrice, setNewClassPrice] = useState(10000);
  const [newClassDuration, setNewClassDuration] = useState(60);
  const [newClassMaxStudents, setNewClassMaxStudents] = useState(1);
  const [newClassLevel, setNewClassLevel] = useState('Todos los niveles');
  const [newClassDescription, setNewClassDescription] = useState('Clase técnica enfocada en golpes específicos, táctica y juego con paredes.');
  const [classToDeleteId, setClassToDeleteId] = useState<string | null>(null);

  // New Coach Hour State
  const [newCoachHourInput, setNewCoachHourInput] = useState('');

  // Push Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('¡Aviso Importante La Pantera Padel! 🐾');
  const [broadcastBody, setBroadcastBody] = useState('Nuevos turnos y torneos disponibles en Jovita. ¡Reserva el tuyo!');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Feedback banner
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const loadData = () => {
    setSlots(StorageService.getSlotsForDate(selectedDate));
    setWaitlist(StorageService.getWaitlist());
    setTournaments(StorageService.getTournaments());
    setBookings(StorageService.getBookings());
    setCoachSchedule(StorageService.getCoachSchedule());
    setClassPackages(StorageService.getClassPackages());
    setClassBookings(StorageService.getClassBookings());
    setCourtPrice(StorageService.getCourtPrice());
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Toggle slot block
  const handleToggleBlock = (slotId: string) => {
    StorageService.toggleSlotBlock(slotId, selectedDate, 'Bloqueo Administración');
    loadData();
    onRefreshData?.();
    showToast('Estado del horario actualizado.');
  };

  // Change court price
  const handleSaveCourtPrice = () => {
    StorageService.setCourtPrice(courtPrice);
    showToast('Precio del turno actualizado a $' + courtPrice.toLocaleString() + ' ARS.');
    onRefreshData?.();
  };

  // Create Tournament
  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourneyName) return;

    const finalCategory = isCustomCategory ? customCategoryText : newTourneyCategory;

    StorageService.createTournament({
      name: newTourneyName,
      category: finalCategory,
      startDate: newTourneyStartDate,
      endDate: newTourneyEndDate,
      prizes: newTourneyPrizes,
      pricePerCouple: Number(newTourneyPrice),
      totalSlots: Number(newTourneySlots),
    });

    setIsCreatingTournament(false);
    setNewTourneyName('');
    loadData();
    onRefreshData?.();
    showToast(`Torneo "${newTourneyName}" creado y publicado con éxito.`);
  };

  // Delete Tournament - Reliable Direct Action (Works 100%)
  const handleDeleteTournamentDirect = (tourneyId: string, tourneyName: string) => {
    StorageService.deleteTournament(tourneyId);
    showToast(`Torneo "${tourneyName}" eliminado correctamente.`);
    setInlineConfirmTourneyId(null);
    setTournamentToDelete(null);
    loadData();
    onRefreshData?.();
  };

  const handleConfirmDeleteTournament = () => {
    if (!tournamentToDelete) return;
    handleDeleteTournamentDirect(tournamentToDelete.id, tournamentToDelete.name);
  };

  const handleChangeTourneyStatus = (id: string, status: any) => {
    StorageService.updateTournamentStatus(id, status);
    loadData();
    onRefreshData?.();
    showToast('Estado del torneo actualizado.');
  };

  // Class Packages Actions (ACADEMIA)
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassTitle) return;

    StorageService.addClassPackage({
      title: newClassTitle,
      price: Number(newClassPrice),
      durationMinutes: Number(newClassDuration),
      maxStudents: Number(newClassMaxStudents),
      level: newClassLevel,
      description: newClassDescription,
      coachName: 'Prof. Tomás Villemur',
    });

    setIsCreatingClass(false);
    setNewClassTitle('');
    loadData();
    onRefreshData?.();
    showToast(`Clase "${newClassTitle}" agregada a la oferta de la academia.`);
  };

  const handleDeleteClassPackage = (packageId: string, title: string) => {
    StorageService.deleteClassPackage(packageId);
    setClassToDeleteId(null);
    loadData();
    onRefreshData?.();
    showToast(`Clase "${title}" eliminada de la academia.`);
  };

  const handleCancelClassBooking = (bookingId: string) => {
    StorageService.cancelClassBooking(bookingId);
    loadData();
    onRefreshData?.();
    showToast('Reserva de clase cancelada.');
  };

  // Copy Day Schedule to Clipboard (For WhatsApp / Bar reception)
  const handleCopyDaySchedule = () => {
    const lines = [
      `🎾 LA PANTERA PADEL - PLANILLA DEL DÍA`,
      `📅 Fecha: ${selectedDate}`,
      `🏟 Cancha: ${COURTS[0].name}`,
      `💰 Tarifa Turno: $${courtPrice.toLocaleString()} ARS ($${Math.round(courtPrice / 4).toLocaleString()} x jugador)`,
      `----------------------------------------`,
    ];

    slots.forEach((s) => {
      if (s.status === 'booked' && s.bookedBy) {
        lines.push(`⏰ ${s.time} -> RESERVADO: ${s.bookedBy.userName} (Tel: ${s.bookedBy.userPhone}) [COBRAR $${courtPrice.toLocaleString()}]`);
      } else if (s.status === 'blocked') {
        lines.push(`⏰ ${s.time} -> BLOQUEADO / CLASES`);
      } else {
        lines.push(`⏰ ${s.time} -> DISPONIBLE`);
      }
    });

    lines.push(`----------------------------------------`);
    lines.push(`🐾 El turno se cobra después de jugar en efectivo o transferencia.`);

    const fullText = lines.join('\n');
    navigator.clipboard.writeText(fullText).then(() => {
      showToast('¡Planilla del día copiada al portapapeles! Lista para pegar en WhatsApp.');
    }).catch(() => {
      showToast('Planilla generada con éxito.');
    });
  };

  // Coach Schedule Actions
  const handleAddCoachHour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoachHourInput) return;
    const updated = StorageService.addCoachHour(newCoachHourInput);
    setCoachSchedule(updated);
    setNewCoachHourInput('');
    onRefreshData?.();
    showToast(`Horario ${newCoachHourInput} hs agregado a la agenda de Tomás Villemur.`);
  };

  const handleRemoveCoachHour = (hour: string) => {
    const updated = StorageService.removeCoachHour(hour);
    setCoachSchedule(updated);
    onRefreshData?.();
    showToast(`Horario ${hour} hs removido.`);
  };

  const handleToggleCoachDay = (dayNum: number) => {
    const updated = StorageService.toggleCoachDay(dayNum);
    setCoachSchedule(updated);
    onRefreshData?.();
    showToast('Días de clase actualizados.');
  };

  // Admin Cancel Booking
  const handleAdminCancelBooking = (bookingId: string) => {
    const res = StorageService.cancelBooking(bookingId);
    if (res.success) {
      loadData();
      onRefreshData?.();
      showToast('Turno cancelado por el administrador. La cancha quedó libre.');
    }
  };

  // Simulation Actions for Testing
  const handleSimulateOccupied = () => {
    StorageService.simulateOccupiedSlot(selectedDate, '20:00 - 21:30');
    loadData();
    onRefreshData?.();
    showToast('Simulación: Turno de las 20:00 marcado como ocupado para probar la lista de espera.');
  };

  const handleSimulateCancellation = () => {
    StorageService.simulateCancellation(selectedDate, '20:00 - 21:30');
    loadData();
    onRefreshData?.();
    showToast('Simulación: Turno liberado. Se despachó aviso Push automático a los interesados.');
  };

  const handleSimulateCouples = (tourneyId: string) => {
    StorageService.simulateTournamentCouples(tourneyId);
    loadData();
    onRefreshData?.();
    showToast('Simulación: Se agregaron 4 parejas de prueba al torneo.');
  };

  const handleResetToCleanSlate = () => {
    StorageService.resetAllData();
    loadData();
    onRefreshData?.();
    showToast('Limpieza total completada: Sistema listo en 0 para producción.');
  };

  // Push Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) return;

    PushNotificationService.dispatchNotification({
      type: 'tournament_update',
      title: broadcastTitle,
      body: broadcastBody,
      actionUrl: '#reservas',
    });

    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
    showToast('Notificación masiva enviada a los socios.');
  };

  const dayNames = [
    { num: 1, label: 'Lunes' },
    { num: 2, label: 'Martes' },
    { num: 3, label: 'Miércoles' },
    { num: 4, label: 'Jueves' },
    { num: 5, label: 'Viernes' },
    { num: 6, label: 'Sábado' },
    { num: 0, label: 'Domingo' },
  ];

  const totalBookedSlots = slots.filter(s => s.status === 'booked').length;
  const totalBlockedSlots = slots.filter(s => s.status === 'blocked').length;
  const occupancyPercentage = Math.round((totalBookedSlots / (slots.length || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl bg-white border-2 border-pink-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-zinc-900 uppercase tracking-wide">
                  Panel de Administración del Club
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold border border-pink-300">
                  Control Total
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500">Cancha única • Torneos dinámicos • Agenda Prof. Tomás Villemur • Simulaciones</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Action toast feedback */}
        {actionSuccessMessage && (
          <div className="bg-pink-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button onClick={() => setActionSuccessMessage(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Top KPIs Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-4 bg-white border-b border-zinc-200 text-xs">
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-zinc-200">
            <span className="text-zinc-500 block text-[11px]">Turnos Hoy</span>
            <span className="text-lg sm:text-xl font-black text-zinc-900">{totalBookedSlots} / {slots.length}</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-zinc-200">
            <span className="text-zinc-500 block text-[11px]">Ocupación Cancha</span>
            <span className="text-lg sm:text-xl font-black text-pink-600">{occupancyPercentage}%</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-zinc-200">
            <span className="text-zinc-500 block text-[11px]">Torneos Activos</span>
            <span className="text-lg sm:text-xl font-black text-zinc-900">{tournaments.length}</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-zinc-200">
            <span className="text-zinc-500 block text-[11px]">Lista de Espera</span>
            <span className="text-lg sm:text-xl font-black text-amber-600">{waitlist.length} jugadores</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 bg-slate-50 px-3 sm:px-5 pt-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'tournaments', label: `Torneos (${tournaments.length})`, icon: Trophy },
            { id: 'slots', label: 'Cancha & Horarios', icon: Calendar },
            { id: 'coach_classes', label: 'Agenda Tomás Villemur', icon: Clock },
            { id: 'bookings', label: `Reservas Activas (${bookings.filter(b => b.status === 'confirmed').length})`, icon: Users },
            { id: 'simulations', label: 'Simulaciones de Prueba', icon: Play },
            { id: 'broadcast', label: 'Push Masivo', icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          
          {/* TAB 1: TOURNAMENTS */}
          {activeTab === 'tournaments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-zinc-900 uppercase">Gestión Total de Torneos</h4>
                  <p className="text-xs text-zinc-500">Crea cualquier torneo con la categoría o suma que desees, elimínalos o cambia su estado.</p>
                </div>
                <button
                  onClick={() => setIsCreatingTournament(!isCreatingTournament)}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start"
                >
                  <Plus className="w-4 h-4" />
                  {isCreatingTournament ? 'Cerrar Formulario' : 'Crear Nuevo Torneo'}
                </button>
              </div>

              {/* Tournament Creation Form */}
              {isCreatingTournament && (
                <form onSubmit={handleCreateTournament} className="p-4 sm:p-5 rounded-2xl bg-white border border-pink-500/40 shadow-sm space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                    <span className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-600" />
                      Nuevo Torneo para La Pantera Padel
                    </span>
                    <button type="button" onClick={() => setIsCreatingTournament(false)} className="text-zinc-400 hover:text-zinc-700">✕</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-700 uppercase">Nombre del Torneo</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Gran Torneo Nocturno Suma 11"
                        value={newTourneyName}
                        onChange={(e) => setNewTourneyName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-700 uppercase flex justify-between">
                        <span>Categoría o Suma</span>
                        <button
                          type="button"
                          onClick={() => setIsCustomCategory(!isCustomCategory)}
                          className="text-pink-600 underline font-semibold text-[10px]"
                        >
                          {isCustomCategory ? 'Elegir de lista' : '+ Escribir personalizada'}
                        </button>
                      </label>
                      
                      {isCustomCategory ? (
                        <input
                          type="text"
                          required
                          placeholder="Ej: Suma 15, Veteranos +50, etc."
                          value={customCategoryText}
                          onChange={(e) => setCustomCategoryText(e.target.value)}
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                        />
                      ) : (
                        <select
                          value={newTourneyCategory}
                          onChange={(e) => setNewTourneyCategory(e.target.value)}
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none font-medium"
                        >
                          {PADEL_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-700 uppercase">Premios a Entregar</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: $400.000 + 2 Paletas + Trofeos"
                        value={newTourneyPrizes}
                        onChange={(e) => setNewTourneyPrizes(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 uppercase">Fecha Inicio</label>
                        <input
                          type="text"
                          required
                          value={newTourneyStartDate}
                          onChange={(e) => setNewTourneyStartDate(e.target.value)}
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 uppercase">Fecha Fin</label>
                        <input
                          type="text"
                          required
                          value={newTourneyEndDate}
                          onChange={(e) => setNewTourneyEndDate(e.target.value)}
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-700 uppercase">Inscripción por Pareja ($ ARS)</label>
                      <input
                        type="number"
                        required
                        value={newTourneyPrice}
                        onChange={(e) => setNewTourneyPrice(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-700 uppercase">Cupo Máximo de Parejas</label>
                      <input
                        type="number"
                        required
                        value={newTourneySlots}
                        onChange={(e) => setNewTourneySlots(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTournament(false)}
                      className="px-4 py-2 rounded-xl bg-slate-200 text-zinc-700 font-bold text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase"
                    >
                      Guardar y Publicar
                    </button>
                  </div>
                </form>
              )}

              {/* Tournament List with Working Delete */}
              {tournaments.length === 0 ? (
                <div className="py-10 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-500 text-xs">
                  No hay torneos creados. Toca en "Crear Nuevo Torneo" para agregar uno.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tournaments.map((t) => (
                    <div key={t.id} className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 uppercase">
                              {t.category}
                            </span>
                            <h5 className="font-black text-zinc-900 text-sm mt-1">{t.name}</h5>
                          </div>
                          
                          {/* REMOVE BUTTON - Inline Confirmation (100% reliable) */}
                          {inlineConfirmTourneyId === t.id ? (
                            <div className="flex items-center gap-1 bg-red-50 p-1.5 rounded-xl border border-red-300 animate-in fade-in shrink-0">
                              <span className="text-[10px] text-red-800 font-bold px-1">¿Borrar?</span>
                              <button
                                onClick={() => handleDeleteTournamentDirect(t.id, t.name)}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black rounded-lg cursor-pointer transition-colors shadow-xs"
                              >
                                Sí, borrar
                              </button>
                              <button
                                onClick={() => setInlineConfirmTourneyId(null)}
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-zinc-700 text-[11px] font-bold rounded-lg cursor-pointer border border-zinc-200 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setInlineConfirmTourneyId(t.id)}
                              title="Eliminar este torneo"
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remover</span>
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-zinc-500 mt-1">{t.prizes}</p>
                        
                        <div className="mt-2 text-xs text-zinc-600 flex justify-between">
                          <span>{t.startDate} - {t.endDate}</span>
                          <span className="font-bold">${t.pricePerCouple.toLocaleString()} x pareja</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-500">
                          Inscritos: <strong className="text-zinc-900">{t.registeredCouplesCount} / {t.totalSlots}</strong>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <select
                            value={t.status}
                            onChange={(e) => handleChangeTourneyStatus(t.id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 border border-zinc-300 text-zinc-800 text-[11px] font-bold"
                          >
                            <option value="inscripciones_abiertas">Inscripción Abierta</option>
                            <option value="en_curso">En Juego</option>
                            <option value="finalizado">Finalizado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SLOTS & COURT MANAGEMENT */}
          {activeTab === 'slots' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-zinc-900 uppercase">
                    Cancha Única: {COURTS[0].name}
                  </h4>
                  <p className="text-xs text-zinc-500">Bloquea turnos por lluvia o turno fijo y ajusta el precio por turno.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyDaySchedule}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    title="Copiar planilla formateada para enviar por WhatsApp a recepción/cantina"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Planilla (WhatsApp)</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-600">Fecha:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Day metrics card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Recaudación Estimada ({selectedDate})</span>
                  <p className="text-base font-black text-pink-600">${(totalBookedSlots * courtPrice).toLocaleString()} ARS</p>
                </div>
                <div className="p-3 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Turnos Reservados</span>
                  <p className="text-base font-black text-zinc-900">{totalBookedSlots} de {slots.length} horarios ({occupancyPercentage}%)</p>
                </div>
                <div className="p-3 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Cobranza en Cancha</span>
                  <p className="text-xs font-semibold text-emerald-700 mt-1">✓ Se cobra al terminar cada turno</p>
                </div>
              </div>

              {/* Price adjustment */}
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-xs text-zinc-900 block">Precio del Turno de 90 min</span>
                  <span className="text-[11px] text-zinc-500">Se divide automáticamente entre los 4 jugadores ($ {Math.round(courtPrice / 4).toLocaleString()} c/u)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-700">$</span>
                  <input
                    type="number"
                    value={courtPrice}
                    onChange={(e) => setCourtPrice(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs font-bold"
                  />
                  <button
                    onClick={handleSaveCourtPrice}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer"
                  >
                    Guardar Precio
                  </button>
                </div>
              </div>

              {/* Slot Grid for the single court */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {slots.map((slot) => {
                  const isBlocked = slot.status === 'blocked';
                  const isBooked = slot.status === 'booked';
                  return (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isBlocked
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : isBooked
                          ? 'bg-slate-100 border-zinc-300 text-zinc-800'
                          : 'bg-white border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <div>
                        <span className="font-black text-zinc-900 text-sm mr-2">{slot.time}</span>
                        <span className="text-[11px] font-medium block sm:inline">
                          {isBlocked ? 'Bloqueado por Club' : isBooked ? `Reservado (${slot.bookedBy?.userName})` : 'Libre'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleBlock(slot.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          isBlocked
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-zinc-800'
                        }`}
                      >
                        {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        {isBlocked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: COACH SCHEDULE (PROF. TOMÁS VILLEMUR) */}
          {activeTab === 'coach_classes' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-zinc-900 uppercase">
                  Gestión de Horarios y Clases • Prof. Tomás Villemur
                </h4>
                <p className="text-xs text-zinc-500">
                  Agrega o quita horarios de entrenamiento, activa o desactiva días de la semana y los cambios se reflejarán de inmediato para los alumnos.
                </p>
              </div>

              {/* Coach profile summary */}
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 flex items-center gap-4">
                <img
                  src={HEAD_COACH.avatar}
                  alt={HEAD_COACH.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-pink-500 shadow-md object-top"
                />
                <div>
                  <h5 className="font-black text-zinc-900 text-base">{HEAD_COACH.name}</h5>
                  <p className="text-xs text-pink-600 font-semibold">{HEAD_COACH.role}</p>
                  <p className="text-xs text-zinc-500">Tel: 03385 43-0525 • Jovita, Córdoba</p>
                </div>
              </div>

              {/* 1. Add / Remove Available Hours */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 space-y-3">
                <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  1. Franjas Horarias Disponibles para Clases
                </h5>

                <div className="flex flex-wrap gap-2 pt-1">
                  {coachSchedule.availableHours.map((hour) => (
                    <div
                      key={hour}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 border border-zinc-300 text-zinc-900 text-xs font-black flex items-center gap-2"
                    >
                      <span>{hour} hs</span>
                      <button
                        onClick={() => handleRemoveCoachHour(hour)}
                        className="text-zinc-400 hover:text-red-600 font-bold cursor-pointer"
                        title="Eliminar este horario"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new hour form */}
                <form onSubmit={handleAddCoachHour} className="pt-2 flex items-center gap-2 max-w-sm">
                  <input
                    type="time"
                    required
                    value={newCoachHourInput}
                    onChange={(e) => setNewCoachHourInput(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Horario
                  </button>
                </form>
              </div>

              {/* 2. Days of week configuration */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 space-y-3">
                <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  2. Días de Dictado de Clases
                </h5>

                <div className="flex flex-wrap gap-2">
                  {dayNames.map((d) => {
                    const isActive = coachSchedule.activeDaysOfWeek.includes(d.num);
                    return (
                      <button
                        key={d.num}
                        onClick={() => handleToggleCoachDay(d.num)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-pink-600 text-white border-pink-500 shadow-xs'
                            : 'bg-slate-100 text-zinc-400 border-zinc-200'
                        }`}
                      >
                        {d.label} {isActive ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Class Packages Management (CREATE & DELETE AT WILL) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                      3. Modalidades y Tipos de Clases de la Academia ({classPackages.length})
                    </h5>
                    <p className="text-[11px] text-zinc-500">
                      Crea o elimina clases a tu gusto con el precio, duración y nivel que elijas. Se sincronizan en vivo en la sección de Academia.
                    </p>
                  </div>

                  {!isCreatingClass && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingClass(true)}
                      className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Nueva Clase</span>
                    </button>
                  )}
                </div>

                {/* Form to add a new class */}
                {isCreatingClass && (
                  <form onSubmit={handleCreateClass} className="p-4 rounded-2xl bg-pink-50/50 border border-pink-300 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-pink-200 pb-2">
                      <span className="text-xs font-black text-pink-700 uppercase">Nueva Modalidad de Clase</span>
                      <button 
                        type="button" 
                        onClick={() => setIsCreatingClass(false)}
                        className="text-zinc-400 hover:text-zinc-700 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-700 uppercase">Nombre / Título de la Clase</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Clínica de Saque y Volea"
                          value={newClassTitle}
                          onChange={(e) => setNewClassTitle(e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-700 uppercase">Precio ($ ARS)</label>
                        <input
                          type="number"
                          required
                          value={newClassPrice}
                          onChange={(e) => setNewClassPrice(Number(e.target.value))}
                          className="w-full mt-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-700 uppercase">Duración (Minutos)</label>
                        <select
                          value={newClassDuration}
                          onChange={(e) => setNewClassDuration(Number(e.target.value))}
                          className="w-full mt-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs font-bold"
                        >
                          <option value={45}>45 minutos</option>
                          <option value={60}>60 minutos (1 hora)</option>
                          <option value={90}>90 minutos (1 hora y media)</option>
                          <option value={120}>120 minutos (2 horas)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-700 uppercase">Alumnos Máximos</label>
                        <select
                          value={newClassMaxStudents}
                          onChange={(e) => setNewClassMaxStudents(Number(e.target.value))}
                          className="w-full mt-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs font-bold"
                        >
                          <option value={1}>1 Alumno (Particular)</option>
                          <option value={2}>2 Alumnos (Pareja)</option>
                          <option value={3}>3 Alumnos</option>
                          <option value={4}>4 Alumnos (Grupal / Clínica)</option>
                          <option value={6}>6 Alumnos (Escuela)</option>
                          <option value={8}>8 Alumnos</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-700 uppercase">Nivel Orientado</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: 4ta a 7ma Categoría / Iniciación"
                          value={newClassLevel}
                          onChange={(e) => setNewClassLevel(e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-700 uppercase">Profesor Asignado</label>
                        <input
                          type="text"
                          disabled
                          value="Prof. Tomás Villemur"
                          className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-zinc-200 text-zinc-600 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-700 uppercase">Descripción de la Clase</label>
                      <textarea
                        rows={2}
                        required
                        value={newClassDescription}
                        onChange={(e) => setNewClassDescription(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingClass(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-200 text-zinc-700 font-bold text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase"
                      >
                        Guardar y Publicar Clase
                      </button>
                    </div>
                  </form>
                )}

                {/* List of current class packages */}
                {classPackages.length === 0 ? (
                  <div className="p-6 text-center text-zinc-400 text-xs border border-dashed border-zinc-300 rounded-xl">
                    No hay clases cargadas en el sistema. Toca en "Agregar Nueva Clase" para crear una.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {classPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-zinc-200 flex flex-col justify-between space-y-2 hover:border-pink-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 uppercase">
                                {pkg.level}
                              </span>
                              <h6 className="font-black text-zinc-900 text-sm mt-1">{pkg.title}</h6>
                            </div>

                            {/* DELETE CLASS BUTTON (Inline reliable confirm) */}
                            {classToDeleteId === pkg.id ? (
                              <div className="flex items-center gap-1 bg-red-100 p-1 rounded-xl border border-red-300 shrink-0">
                                <span className="text-[10px] text-red-800 font-bold px-1">¿Borrar?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClassPackage(pkg.id, pkg.title)}
                                  className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-lg cursor-pointer"
                                >
                                  Sí
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setClassToDeleteId(null)}
                                  className="px-2 py-0.5 bg-white text-zinc-700 text-[10px] font-bold rounded-lg cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setClassToDeleteId(pkg.id)}
                                title="Borrar esta clase de la academia"
                                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Borrar</span>
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{pkg.description}</p>
                        </div>

                        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-zinc-500">
                            {pkg.durationMinutes} min • Máx {pkg.maxStudents} {pkg.maxStudents === 1 ? 'alumno' : 'alumnos'}
                          </span>
                          <span className="font-black text-pink-600 text-sm">
                            ${pkg.price.toLocaleString()} ARS
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Student Bookings for Classes */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 space-y-3">
                <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  4. Alumnos Agendados para Clases ({classBookings.filter(b => b.status === 'confirmed').length})
                </h5>

                {classBookings.filter(b => b.status === 'confirmed').length === 0 ? (
                  <p className="text-xs text-zinc-400 py-3 text-center">
                    No hay alumnos agendados para clases por el momento.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {classBookings.filter(b => b.status === 'confirmed').map((cb) => (
                      <div
                        key={cb.id}
                        className="p-3 rounded-xl bg-slate-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-bold text-zinc-900">{cb.studentName}</span>
                          <span className="text-zinc-500 ml-2">({cb.packageTitle})</span>
                          <p className="text-[11px] text-pink-600 font-semibold mt-0.5">
                            Fecha: {cb.date} a las {cb.time} hs • Tel: {cb.studentPhone}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCancelClassBooking(cb.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold border border-red-200 self-start sm:self-auto cursor-pointer"
                        >
                          Cancelar Clase
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: ACTIVE BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-zinc-900 uppercase">
                  Control de Reservas de Turnos
                </h4>
                <p className="text-xs text-zinc-500">
                  Visualiza quién reservó cada turno, los montos y cancela reservas si es necesario.
                </p>
              </div>

              {bookings.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-xs">
                  No hay reservas registradas en el sistema (Estado 0).
                </div>
              ) : (
                <div className="space-y-2">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 text-sm">{b.userName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                          }`}>
                            {b.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          {b.courtName} • {b.date} a las {b.timeSlot} (${b.price.toLocaleString()})
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Contacto: {b.userEmail} | {b.userPhone}
                        </p>
                      </div>

                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleAdminCancelBooking(b.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold self-start sm:self-auto cursor-pointer"
                        >
                          Cancelar Turno
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SIMULACIONES PARA EL ADMIN */}
          {activeTab === 'simulations' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-zinc-900 uppercase">
                  Herramientas de Simulación y Pruebas
                </h4>
                <p className="text-xs text-zinc-500">
                  Usa estos botones para simular casos de prueba sin afectar a clientes reales, o limpia la base para producción.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                  <span className="font-bold text-xs text-zinc-900 block">1. Simular Turno Ocupado</span>
                  <p className="text-xs text-zinc-500">
                    Ocupa el turno de las 20:00 - 21:30 para probar cómo se ve en la web y cómo los usuarios pueden unirse a la Lista de Espera.
                  </p>
                  <button
                    onClick={handleSimulateOccupied}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-pink-600" />
                    Simular Turno Ocupado
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-pink-300 space-y-2">
                  <span className="font-bold text-xs text-pink-600 block">2. Simular Cancelación y Push</span>
                  <p className="text-xs text-zinc-500">
                    Libera el turno de las 20:00 y dispara el aviso de Web Push automático a los usuarios que estén en lista de espera.
                  </p>
                  <button
                    onClick={handleSimulateCancellation}
                    className="w-full py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Simular Turno Liberado
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                  <span className="font-bold text-xs text-zinc-900 block">3. Simular Parejas en Torneo</span>
                  <p className="text-xs text-zinc-500">
                    Inscribe automáticamente 4 parejas de prueba en el primer torneo para verificar los cupos y la grilla.
                  </p>
                  <button
                    onClick={() => tournaments[0] && handleSimulateCouples(tournaments[0].id)}
                    disabled={tournaments.length === 0}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Cargar 4 Parejas de Prueba
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 space-y-2">
                  <span className="font-bold text-xs text-red-700 block">4. Resetear Todo a Cero (Producción)</span>
                  <p className="text-xs text-zinc-500">
                    Borra todas las reservas y pruebas anteriores, dejando la cancha y la plataforma 100% limpias para uso real.
                  </p>
                  <button
                    onClick={handleResetToCleanSlate}
                    className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Limpiar Todo a Cero
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PUSH BROADCAST */}
          {activeTab === 'broadcast' && (
            <form onSubmit={handleSendBroadcast} className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4 max-w-lg">
              <div>
                <h4 className="text-sm font-black text-zinc-900 uppercase">Enviar Push Masivo a Socios</h4>
                <p className="text-xs text-zinc-500">Llegará a los celulares de todos los jugadores de La Pantera Padel.</p>
              </div>

              {broadcastSent && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  ¡Notificación masiva enviada a los usuarios con éxito!
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-zinc-700 uppercase">Título del Aviso</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-700 uppercase">Mensaje</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Disparar Web Push Ahora
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold cursor-pointer"
          >
            Cerrar Dashboard
          </button>
        </div>

      </div>

      {/* CUSTOM IN-APP DELETE TOURNAMENT MODAL (100% reliable, no window.confirm) */}
      {tournamentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in zoom-in-95">
          <div className="w-full max-w-sm bg-white border-2 border-red-500 rounded-3xl p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="text-base font-black text-zinc-900 uppercase">¿Eliminar este torneo?</h4>
            <p className="text-xs text-zinc-600 mt-2">
              Se eliminará <strong className="text-zinc-900 font-bold">"{tournamentToDelete.name}"</strong> ({tournamentToDelete.category}) y todas sus parejas registradas.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setTournamentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-700 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteTournament}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase cursor-pointer shadow-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
