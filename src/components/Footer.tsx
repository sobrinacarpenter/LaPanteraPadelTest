import React from 'react';
import { Instagram, Phone, MapPin, Trophy, Calendar, Database, Shield, Heart } from 'lucide-react';
import { CLUB_DETAILS, HEAD_COACH } from '../data/mockData';

interface Props {
  onOpenArchitecture: () => void;
  onOpenAdmin: () => void;
  onNavigate: (section: string) => void;
}

export const Footer: React.FC<Props> = ({ onOpenArchitecture, onOpenAdmin, onNavigate }) => {
  return (
    <footer className="bg-white border-t border-zinc-200 pt-16 pb-24 md:pb-16 text-zinc-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Club Identity */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src={CLUB_DETAILS.logoUrl}
                alt="La Pantera Padel"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-500 shadow-md bg-white"
              />
              <div>
                <span className="text-base font-black text-zinc-900 uppercase italic">
                  LA PANTERA <span className="text-pink-600">PADEL</span>
                </span>
                <p className="text-[11px] text-zinc-400">Jovita, Córdoba, Argentina</p>
              </div>
            </div>

            <p className="text-zinc-500 text-xs leading-relaxed">
              Cancha oficial de cristal panorámico WPT 12mm, césped monofilamento azul, iluminación LED 200W y bar tercer tiempo.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={CLUB_DETAILS.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 border border-zinc-200 hover:border-pink-300 flex items-center justify-center text-zinc-700 hover:text-pink-600 transition-colors"
                title="Instagram La Pantera Padel"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${CLUB_DETAILS.phoneClean}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 border border-zinc-200 hover:border-emerald-400 flex items-center justify-center text-zinc-700 hover:text-emerald-600 transition-colors"
                title="WhatsApp Club"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-3">Plataforma</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('reservas')} className="hover:text-pink-600 transition-colors cursor-pointer">
                  Reservar Turno de Pádel
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('torneos')} className="hover:text-pink-600 transition-colors cursor-pointer">
                  Torneos Oficiales & Cuadros en Vivo
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('academia')} className="hover:text-pink-600 transition-colors cursor-pointer">
                  Clases con {HEAD_COACH.name}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('club')} className="hover:text-pink-600 transition-colors cursor-pointer">
                  Ubicación & Cancha en Jovita
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Location */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-3">Contacto Directo</h4>
            <p className="flex items-start gap-2 text-zinc-700">
              <MapPin className="w-3.5 h-3.5 text-pink-600 shrink-0 mt-0.5" />
              <span>{CLUB_DETAILS.address}</span>
            </p>
            <p className="flex items-center gap-2 text-zinc-700">
              <Phone className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <span>Tel: {CLUB_DETAILS.phone}</span>
            </p>
            <p className="text-zinc-500 text-[11px] pt-1">
              {CLUB_DETAILS.openHours}
            </p>
          </div>

          {/* Col 4: Tech & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-3">Ingeniería & Club</h4>
            <button
              onClick={onOpenArchitecture}
              className="w-full p-2.5 rounded-xl bg-slate-100 border border-zinc-200 hover:border-pink-300 text-left text-xs font-semibold text-zinc-800 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-pink-600" />
                Esquema PostgreSQL & Stack
              </span>
              <span>→</span>
            </button>
            <button
              onClick={onOpenAdmin}
              className="w-full p-2.5 rounded-xl bg-slate-100 border border-zinc-200 hover:border-pink-300 text-left text-xs font-semibold text-zinc-800 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-pink-600" />
                Panel de Administración
              </span>
              <span>→</span>
            </button>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div>
            © 2026 La Pantera Padel • Todos los derechos reservados. Jovita, Córdoba, Argentina.
          </div>
          <div className="flex items-center gap-2 font-medium text-zinc-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sistema Web Push & Alta Velocidad Activo</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
