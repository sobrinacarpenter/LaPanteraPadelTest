import React, { useState, useEffect } from 'react';
import { Bell, Check, Volume2, VolumeX, Sparkles, AlertCircle, Trash2, Smartphone } from 'lucide-react';
import { AppNotification, PushPreferences } from '../types';
import { PushNotificationService } from '../services/pushNotificationService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const NotificationModal: React.FC<Props> = ({ isOpen, onClose, onNavigateSection }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(PushNotificationService.getPermissionStatus());
  const [preferences, setPreferences] = useState<PushPreferences>(PushNotificationService.getPreferences());
  const [activeTab, setActiveTab] = useState<'inbox' | 'settings' | 'simulate'>('inbox');

  useEffect(() => {
    const unsubscribe = PushNotificationService.subscribe((list) => {
      setNotifications(list);
    });
    setPermission(PushNotificationService.getPermissionStatus());
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await PushNotificationService.requestPermission();
    setPermission(res);
  };

  const handleTogglePref = (key: keyof PushPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    PushNotificationService.savePreferences(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white border-2 border-pink-500/40 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 border border-pink-300 flex items-center justify-center text-pink-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-zinc-900 tracking-wide">Centro de Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-pink-600 text-white rounded-full">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">Alertas de turnos, listas de espera y torneos en tiempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Browser Permission Banner */}
        {permission !== 'granted' && (
          <div className="p-4 bg-pink-50 border-b border-pink-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-pink-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-zinc-900">Activa las Notificaciones Web Push</p>
                <p className="text-zinc-600">Recibe avisos al instante cuando se liberen turnos de tu interés.</p>
              </div>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white rounded-xl shadow-xs transition-transform active:scale-95 shrink-0"
            >
              Habilitar
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 bg-slate-50 px-5 pt-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'inbox'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Bandeja ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('simulate')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'simulate'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulador de Pruebas
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Preferencias
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
          {activeTab === 'inbox' && (
            <>
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 space-y-2">
                  <Bell className="w-10 h-10 mx-auto text-zinc-300" />
                  <p className="text-sm font-bold text-zinc-700">No tienes notificaciones pendientes</p>
                  <p className="text-xs text-zinc-500">Prueba reservar un turno o usar el Simulador para ver cómo funcionan.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 text-xs text-zinc-500 border-b border-zinc-100">
                    <span>Historial reciente</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => PushNotificationService.markAllAsRead()}
                        className="hover:text-pink-600 transition-colors font-medium"
                      >
                        Marcar leídas
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => PushNotificationService.clearAll()}
                        className="hover:text-red-600 transition-colors flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3 h-3" /> Limpiar
                      </button>
                    </div>
                  </div>
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        PushNotificationService.markAsRead(item.id);
                        if (item.actionUrl) {
                          onClose();
                          const section = item.actionUrl.replace('#', '');
                          onNavigateSection?.(section);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        item.read
                          ? 'bg-slate-50 border-zinc-200 text-zinc-600'
                          : 'bg-pink-50/40 border-pink-300 text-zinc-900 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                          {!item.read && <span className="w-2 h-2 rounded-full bg-pink-600 animate-pulse" />}
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-mono">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{item.body}</p>
                      {item.actionUrl && (
                        <div className="mt-2 text-[11px] text-pink-600 font-bold flex items-center gap-1">
                          Ver detalles →
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {activeTab === 'simulate' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-zinc-200 text-xs text-zinc-600">
                <p className="font-bold text-zinc-900 mb-1">Prueba los 5 tipos de notificaciones push del sistema:</p>
                <p>Haz clic en cualquiera de los botones para disparar una notificación con sonido, vibración y aviso en pantalla.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => PushNotificationService.notifyBookingConfirmed('Cancha La Pantera WPT', 'Hoy', '20:00 - 21:30')}
                  className="p-3 text-left rounded-2xl bg-white hover:bg-slate-50 border border-zinc-200 hover:border-pink-300 transition-all group shadow-xs cursor-pointer"
                >
                  <div className="text-xs font-bold text-pink-600 group-hover:text-pink-700">🐾 1. Confirmación de Reserva</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Disparada inmediatamente al confirmar turno.</div>
                </button>

                <button
                  onClick={() => PushNotificationService.notifyTurnReminder('Cancha La Pantera WPT', '20:00')}
                  className="p-3 text-left rounded-2xl bg-white hover:bg-slate-50 border border-zinc-200 hover:border-pink-300 transition-all group shadow-xs cursor-pointer"
                >
                  <div className="text-xs font-bold text-amber-600 group-hover:text-amber-700">⏰ 2. Recordatorio Próximo Turno</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Aviso 2 horas antes del partido en Jovita.</div>
                </button>

                <button
                  onClick={() => PushNotificationService.notifyWaitlistFreed('Cancha La Pantera WPT', 'Hoy', '20:00')}
                  className="p-3 text-left rounded-2xl bg-white hover:bg-slate-50 border border-pink-400 hover:border-pink-500 transition-all group relative overflow-hidden shadow-xs cursor-pointer"
                >
                  <div className="text-xs font-bold text-pink-600 flex items-center gap-1">
                    ⚡ 3. Alerta Lista de Espera
                    <span className="text-[9px] px-1.5 py-0.2 bg-pink-100 text-pink-800 rounded">Destacada</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Se dispara si otro usuario cancela su turno.</div>
                </button>

                <button
                  onClick={() => PushNotificationService.notifyTournamentUpdate('Copa Apertura La Pantera', '¡Resultados de Cuartos! M. López / G. Rossi avanzan a Semifinales (6-3, 6-3).')}
                  className="p-3 text-left rounded-2xl bg-white hover:bg-slate-50 border border-zinc-200 hover:border-pink-300 transition-all group shadow-xs cursor-pointer"
                >
                  <div className="text-xs font-bold text-blue-600 group-hover:text-blue-700">🏆 4. Actualización de Torneo</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Aviso de llaves, cruces y resultados en vivo.</div>
                </button>

                <button
                  onClick={() => PushNotificationService.notifyClassAvailable('Prof. Tomás Villemur', 'Mañana', '18:00')}
                  className="p-3 text-left rounded-2xl bg-white hover:bg-slate-50 border border-zinc-200 hover:border-pink-300 transition-all group sm:col-span-2 shadow-xs cursor-pointer"
                >
                  <div className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700">🎾 5. Cupo Disponible con Prof. Tomás Villemur</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Alerta automática sobre horarios libres sin usar WhatsApp.</div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    {preferences.soundEnabled ? <Volume2 className="w-4 h-4 text-pink-600" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
                    Efecto Sonoro de Alerta
                  </h5>
                  <p className="text-[11px] text-zinc-500">Chime deportivo al recibir avisos importantes</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.soundEnabled}
                  onChange={() => handleTogglePref('soundEnabled')}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Canales de Notificación</p>
                
                {[
                  { key: 'bookingConfirmations', label: 'Confirmaciones de Reserva', desc: 'Comprobante y detalles del turno reservado' },
                  { key: 'turnReminders', label: 'Recordatorios de Turnos', desc: 'Avisos preventivos 2 horas antes' },
                  { key: 'waitlistAlerts', label: 'Lista de Espera Inteligente', desc: 'Aviso inmediato si un turno ocupado se da de baja' },
                  { key: 'tournamentUpdates', label: 'Torneos y Cuadros en Vivo', desc: 'Cruces, categorías y resultados de partidos' },
                  { key: 'classAvailability', label: 'Clases con Prof. Tomás Villemur', desc: 'Disponibilidad de horarios del profesor' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-zinc-200 hover:border-pink-300 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{item.label}</p>
                      <p className="text-[10px] text-zinc-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[item.key as keyof PushPreferences] as boolean}
                      onChange={() => handleTogglePref(item.key as keyof PushPreferences)}
                      className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-slate-50 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>FCM & Web Push Engine v2.4</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
