import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, GraduationCap, MapPin, Bell, User, Shield, Menu, X, Smartphone, Database } from 'lucide-react';
import { PushNotificationService } from '../services/pushNotificationService';
import { StorageService } from '../services/storageService';
import { CLUB_DETAILS } from '../data/mockData';

interface Props {
  onOpenNotifications: () => void;
  onOpenMyBookings: () => void;
  onOpenArchitecture: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  currentSection: string;
  onNavigate: (section: string) => void;
}

export const Navbar: React.FC<Props> = ({
  onOpenNotifications,
  onOpenMyBookings,
  onOpenArchitecture,
  isAdmin,
  onToggleAdmin,
  currentSection,
  onNavigate,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userBookingsCount, setUserBookingsCount] = useState(0);

  useEffect(() => {
    const unsub = PushNotificationService.subscribe((list) => {
      setUnreadCount(list.filter(n => !n.read).length);
    });

    const updateBookings = () => {
      const active = StorageService.getBookings().filter(b => b.status === 'confirmed');
      setUserBookingsCount(active.length);
    };

    updateBookings();
    const interval = setInterval(updateBookings, 3000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleNavClick = (section: string) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => handleNavClick('hero')} 
            className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group min-w-0 mr-1 sm:mr-3"
          >
            <div className="relative shrink-0">
              <img
                src={CLUB_DETAILS.logoUrl}
                alt="La Pantera Padel Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-pink-500 group-hover:scale-105 transition-all shadow-md bg-white shrink-0"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm xs:text-base sm:text-xl font-black tracking-tight text-zinc-900 uppercase italic truncate">
                  LA PANTERA <span className="text-pink-600">PADEL</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-black tracking-wider uppercase px-2 py-0.5 bg-pink-100 text-pink-700 border border-pink-200 rounded-md shrink-0">
                  Jovita
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-zinc-500 font-medium truncate">
                Turnos al instante • Torneos • Clases
              </p>
              <p className="md:hidden text-[10px] text-zinc-500 font-medium truncate">
                Cancha Única • Jovita
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: 'reservas', label: 'Reservar Turno', icon: Calendar },
              { id: 'torneos', label: 'Torneos en Vivo', icon: Trophy },
              { id: 'academia', label: 'Clases con Tomás', icon: GraduationCap },
              { id: 'club', label: 'El Club en Jovita', icon: MapPin },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-pink-100 text-pink-800 border border-pink-300 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Architecture / DDL Modal Button */}
            <button
              onClick={onOpenArchitecture}
              title="Ver Esquema SQL & Stack Técnico"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-zinc-200 hover:border-pink-300 text-xs font-bold text-zinc-700 hover:text-zinc-900 transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-pink-600" />
              <span>Arquitectura</span>
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 sm:p-2.5 rounded-xl bg-slate-100 border border-zinc-200 hover:border-pink-300 text-zinc-700 hover:text-zinc-900 transition-all group cursor-pointer"
              title="Notificaciones Push"
            >
              <Bell className="w-4 h-4 group-hover:text-pink-600 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-pink-600 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* My Bookings Button */}
            <button
              onClick={onOpenMyBookings}
              className="relative p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-zinc-200 text-xs font-bold text-zinc-900 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer"
              title="Mis Turnos"
            >
              <User className="w-3.5 h-3.5 text-pink-600" />
              <span className="hidden sm:inline">Mis Turnos</span>
              {userBookingsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {userBookingsCount}
                </span>
              )}
            </button>

            {/* Admin Toggle */}
            <button
              onClick={onToggleAdmin}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isAdmin
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-slate-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900'
              }`}
              title="Modo Administración del Club"
            >
              <Shield className={`w-3.5 h-3.5 ${isAdmin ? 'text-white' : 'text-zinc-500'}`} />
              <span className="hidden sm:inline">{isAdmin ? 'Admin Activo' : 'Admin'}</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 sm:p-2.5 rounded-xl bg-slate-100 border border-zinc-200 text-zinc-700"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-zinc-200 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200 shadow-lg">
            {[
              { id: 'reservas', label: 'Reservar Turno', icon: Calendar },
              { id: 'torneos', label: 'Torneos y Cuadros en Vivo', icon: Trophy },
              { id: 'academia', label: 'Clases con Prof. Tomás Villemur', icon: GraduationCap },
              { id: 'club', label: 'Ubicación y Cancha (Jovita)', icon: MapPin },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-zinc-200 text-left text-sm font-bold text-zinc-800 flex items-center gap-3 active:bg-pink-50 active:text-pink-600"
                >
                  <Icon className="w-4 h-4 text-pink-600" />
                  {item.label}
                </button>
              );
            })}

            <div className="pt-2 border-t border-zinc-200 flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenArchitecture();
                }}
                className="flex-1 p-2.5 rounded-xl bg-slate-100 border border-zinc-200 text-xs font-bold text-zinc-700 flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4 text-pink-600" />
                Arquitectura
              </button>
              <a
                href={`https://wa.me/${CLUB_DETAILS.phoneClean}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 px-4"
              >
                WhatsApp Club
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Floating Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/95 backdrop-blur-lg border border-zinc-300 rounded-2xl p-1.5 shadow-xl flex items-center justify-around">
        <button
          onClick={() => onNavigate('reservas')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            currentSection === 'reservas' ? 'text-pink-600 bg-pink-50' : 'text-zinc-600'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-black">Turnos</span>
        </button>
        <button
          onClick={() => onNavigate('torneos')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            currentSection === 'torneos' ? 'text-pink-600 bg-pink-50' : 'text-zinc-600'
          }`}
        >
          <Trophy className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-black">Torneos</span>
        </button>
        <button
          onClick={() => onNavigate('academia')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            currentSection === 'academia' ? 'text-pink-600 bg-pink-50' : 'text-zinc-600'
          }`}
        >
          <GraduationCap className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-black">Clases</span>
        </button>
        <button
          onClick={onOpenMyBookings}
          className="flex flex-col items-center py-1.5 px-3 rounded-xl text-zinc-600 hover:text-zinc-900 relative"
        >
          <User className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-black">Mis Turnos</span>
          {userBookingsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-pink-600" />
          )}
        </button>
      </div>
    </>
  );
};
