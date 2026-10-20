import React, { useState, useEffect } from 'react';
import { User, Calendar, Clock, AlertTriangle, CheckCircle, Trash2, Shield, BellRing, Phone, Mail } from 'lucide-react';
import { Booking } from '../types';
import { StorageService } from '../services/storageService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSlotFreed?: () => void;
}

export const MyBookingsModal: React.FC<Props> = ({ isOpen, onClose, onSlotFreed }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellationSuccessMsg, setCancellationSuccessMsg] = useState<string | null>(null);
  const currentUser = StorageService.getCurrentUser();

  const loadBookings = () => {
    const list = StorageService.getBookings();
    setBookings(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadBookings();
      setCancellationSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmCancel = () => {
    if (!bookingToCancel) return;

    const res = StorageService.cancelBooking(bookingToCancel.id);
    if (res.success) {
      setCancellationSuccessMsg(`¡Turno de las ${bookingToCancel.timeSlot} cancelado! La cancha quedó disponible de inmediato en la web y la lista de espera fue notificada automáticamente.`);
      setBookingToCancel(null);
      loadBookings();
      onSlotFreed?.();
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-white border-2 border-pink-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 border border-pink-300 flex items-center justify-center text-pink-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                Mi Perfil y Turnos Activos
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold">
                  {currentUser.category || '5ta Categoría'}
                </span>
              </h3>
              <p className="text-xs text-zinc-500">{currentUser.name} • {currentUser.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 text-lg">✕</button>
        </div>

        {/* Cancellation Success Feedback */}
        {cancellationSuccessMsg && (
          <div className="m-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-zinc-900 mb-0.5">Cancelación Automatizada Exitosa</strong>
              {cancellationSuccessMsg}
            </div>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Turnos Confirmados ({activeBookings.length})
            </h4>
            <span className="text-[11px] text-pink-600 font-bold">Cancelación libre sin mensajes</span>
          </div>

          {activeBookings.length === 0 ? (
            <div className="py-10 text-center text-zinc-400 space-y-2 border border-dashed border-zinc-300 rounded-2xl bg-slate-50">
              <Calendar className="w-8 h-8 mx-auto text-zinc-300" />
              <p className="text-sm text-zinc-700 font-bold">No tienes turnos activos en este momento</p>
              <p className="text-xs text-zinc-500">Selecciona un horario en la grilla para reservar tu cancha.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-zinc-200 hover:border-pink-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-black text-pink-600 uppercase tracking-wide block">
                        {b.courtName}
                      </span>
                      <div className="text-base font-black text-zinc-900 flex items-center gap-2 mt-0.5">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        {b.date} • {b.timeSlot}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Titular: <span className="text-zinc-900 font-medium">{b.userName}</span> ({b.userPhone})
                      </p>
                    </div>

                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Confirmado
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-zinc-600 block">Total: <strong className="text-zinc-900">${b.price.toLocaleString()}</strong></span>
                      <span className="text-[10px] text-emerald-700 font-medium">Se abona después de jugar con quien atienda</span>
                    </div>
                    
                    {/* CANCEL BUTTON */}
                    <button
                      onClick={() => setBookingToCancel(b)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Cancelar Turno
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div className="pt-4 border-t border-zinc-200">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Historial de Turnos Cancelados ({pastBookings.length})
              </h4>
              <div className="space-y-2 opacity-70">
                {pastBookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-2.5 rounded-xl bg-slate-50 border border-zinc-200 text-xs flex justify-between items-center text-zinc-600">
                    <span>{b.courtName} • {b.date} ({b.timeSlot})</span>
                    <span className="text-red-600 font-bold text-[10px]">Cancelado</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-slate-50 flex items-center justify-between text-xs text-zinc-500">
          <span>La Pantera Padel • Jovita</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
          >
            Cerrar
          </button>
        </div>

      </div>

      {/* CONFIRM CANCELLATION MODAL */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in zoom-in-95">
          <div className="w-full max-w-sm bg-white border-2 border-red-500 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-black text-zinc-900 uppercase">¿Cancelar este turno?</h4>
            <p className="text-xs text-zinc-600 mt-2">
              Se dará de baja tu reserva en <strong className="text-zinc-900">{bookingToCancel.courtName}</strong> para el <strong className="text-zinc-900">{bookingToCancel.date} a las {bookingToCancel.timeSlot}</strong>.
            </p>

            <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800 text-left">
              ⚡ <strong>Automatización:</strong> La cancha se liberará en tiempo real y el sistema enviará aviso Push automático a los usuarios que estén en lista de espera.
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setBookingToCancel(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-zinc-700 font-bold text-xs"
              >
                No, mantener
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
