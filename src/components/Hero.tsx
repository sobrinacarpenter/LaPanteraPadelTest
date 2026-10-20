import React from 'react';
import { Calendar, Zap, Sparkles, PhoneCall } from 'lucide-react';
import { CLUB_DETAILS, HEAD_COACH } from '../data/mockData';

interface Props {
  onScrollToSection: (sectionId: string) => void;
  onOpenNotifications: () => void;
}

export const Hero: React.FC<Props> = ({ onScrollToSection, onOpenNotifications }) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-8 md:pt-12 md:pb-12 bg-white">
      {/* Subtle ambient pink glow behind logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-pink-100/60 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        
        {/* Logo Badge */}
        <div className="flex justify-center mb-3">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-pink-500/40 blur-md group-hover:opacity-100 transition duration-300" />
            <img
              src={CLUB_DETAILS.logoUrl}
              alt="La Pantera Padel"
              className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-pink-500 bg-white shadow-lg"
            />
          </div>
        </div>

        {/* Club Tag & Location */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-zinc-200 text-zinc-700 text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-pink-600 animate-pulse" />
          <span>Cancha Panorámica de Cristal WPT</span>
          <span className="text-zinc-400">•</span>
          <span>Jovita, Córdoba</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-zinc-900 leading-tight mb-2">
          RESERVA TU TURNO <span className="text-pink-600">EN 1 TOQUE</span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto font-normal leading-relaxed mb-6">
          Elige tu horario y confirma al instante. Si está ocupado, la <strong className="text-pink-600 font-bold">lista de espera</strong> te avisa por Push si se cancela.
        </p>

        {/* Direct Action Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => onScrollToSection('reservas')}
            className="py-3 px-6 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current" />
            Elegir Horario Libre
          </button>

          <button
            onClick={() => onScrollToSection('academia')}
            className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-zinc-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-pink-600" />
            Clases con Tomás Villemur
          </button>

          <a
            href={`https://wa.me/${CLUB_DETAILS.phoneClean}?text=Hola%20La%20Pantera%20Padel,%20quiero%20consultar%20por%20turnos`}
            target="_blank"
            rel="noreferrer"
            className="py-3 px-4 rounded-2xl bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">03385 43-0525</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
