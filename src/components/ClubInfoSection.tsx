import React from 'react';
import { MapPin, Phone, Clock, ExternalLink, ShieldCheck, Sparkles, Navigation, MessageCircle } from 'lucide-react';
import { CLUB_DETAILS, COURTS } from '../data/mockData';

export const ClubInfoSection: React.FC = () => {
  return (
    <section id="club" className="py-16 md:py-24 relative bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 border border-pink-300 text-pink-700 text-xs font-bold uppercase mb-3">
            <MapPin className="w-4 h-4" />
            Nuestras Instalaciones
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 uppercase tracking-tight">
            EL CLUB Y SU UBICACIÓN EN JOVITA
          </h2>
          <p className="text-base text-zinc-600 mt-2">
            La mejor cancha panorámica de Jovita, Córdoba. Disfruta del partido y del tercer tiempo con amigos.
          </p>
        </div>

        {/* Grid: Amenities & Map Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Location & Contact Details */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <img
                  src={CLUB_DETAILS.logoUrl}
                  alt={CLUB_DETAILS.name}
                  className="w-16 h-16 rounded-full ring-2 ring-pink-500 shadow-md bg-white"
                />
                <div>
                  <h3 className="text-xl font-black text-zinc-900 uppercase">{CLUB_DETAILS.name}</h3>
                  <p className="text-xs text-pink-600 font-bold">{CLUB_DETAILS.tagline}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100 text-xs">
                
                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 border border-pink-200 text-pink-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-zinc-900 block text-sm">Dirección</strong>
                    <span className="text-zinc-600">{CLUB_DETAILS.address}</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 border border-pink-200 text-pink-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-zinc-900 block text-sm">Teléfono / WhatsApp</strong>
                    <span className="text-zinc-600">{CLUB_DETAILS.phone}</span>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 border border-pink-200 text-pink-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-zinc-900 block text-sm">Horarios de Apertura</strong>
                    <span className="text-zinc-600">{CLUB_DETAILS.openHours}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-2.5">
              <a
                href={CLUB_DETAILS.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Navigation className="w-4 h-4" />
                Abrir en Google Maps
              </a>
              <a
                href={`https://wa.me/${CLUB_DETAILS.phoneClean}?text=Hola%20La%20Pantera%20Padel`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Right Column: Amenities Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CLUB_DETAILS.amenities.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs hover:border-pink-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-zinc-200 flex items-center justify-center text-pink-600 mb-3 font-black text-xs">
                    0{idx + 1}
                  </div>
                  <h4 className="text-base font-bold text-zinc-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[10px] text-pink-600 font-bold uppercase">
                  <span>Equipamiento Oficial</span>
                  <span>•</span>
                  <span>Jovita</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
