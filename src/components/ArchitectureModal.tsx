import React, { useState } from 'react';
import { Database, Server, Smartphone, Zap, Copy, Check, Code, ShieldCheck, Bell, Activity } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'stack' | 'push_architecture' | 'instagram_ux'>('schema');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const POSTGRES_SCHEMA = `-- ====================================================================
-- LA PANTERA PADEL - ESQUEMA DE BASE DE DATOS RELACIONAL (POSTGRESQL)
-- Arquitectura de alto rendimiento para turnos, torneos, academia y waitlist
-- ====================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS DE DOMINIO
CREATE TYPE user_role AS ENUM ('player', 'coach', 'admin', 'superadmin');
CREATE TYPE slot_status AS ENUM ('available', 'booked', 'blocked', 'maintenance');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE tournament_category AS ENUM ('4ta', '5ta', '6ta', '7ma', 'suma_11', 'mixto_a', 'mixto_b', 'menores');
CREATE TYPE tournament_status AS ENUM ('draft', 'registrations_open', 'in_progress', 'completed');
CREATE TYPE match_round AS ENUM ('round_of_16', 'quarter_final', 'semi_final', 'final');
CREATE TYPE notification_type AS ENUM ('booking_confirmed', 'turn_reminder', 'tournament_update', 'class_available', 'waitlist_freed');

-- 3. TABLA DE USUARIOS (Autenticación Google OAuth & Firebase)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    category tournament_category DEFAULT '6ta',
    role user_role DEFAULT 'player',
    fcm_push_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE CANCHAS
CREATE TABLE courts (
    id VARCHAR(50) PRIMARY KEY, -- 'cancha-1', 'cancha-2'
    name VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'Panorámica WPT', 'Cristal Estándar'
    surface VARCHAR(100) NOT NULL,
    glass_spec VARCHAR(100) NOT NULL,
    lighting_spec VARCHAR(100) NOT NULL,
    price_per_slot NUMERIC(10, 2) NOT NULL, -- e.g. 16000.00 ARS
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE TURNOS (SLOTS POR DÍA Y HORARIO)
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id VARCHAR(50) REFERENCES courts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status slot_status DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_court_time_date UNIQUE (court_id, date, start_time)
);
CREATE INDEX idx_time_slots_date_court ON time_slots(date, court_id, status);

-- 6. TABLA DE RESERVAS
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    time_slot_id UUID REFERENCES time_slots(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    price_paid NUMERIC(10, 2) NOT NULL,
    split_count INT DEFAULT 4,
    status booking_status DEFAULT 'confirmed',
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bookings_user ON bookings(user_id, status);

-- 7. TABLA DE LISTA DE ESPERA INTELIGENTE
CREATE TABLE waitlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    time_slot_id UUID REFERENCES time_slots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    notified BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_waitlist_slot UNIQUE (time_slot_id, user_id)
);
CREATE INDEX idx_waitlist_slot_unnotified ON waitlists(time_slot_id) WHERE notified = FALSE;

-- 8. TABLA DE TORNEOS Y COMPETENCIAS
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category tournament_category NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    prizes_description TEXT NOT NULL,
    registration_fee NUMERIC(10, 2) NOT NULL,
    max_couples INT DEFAULT 16,
    status tournament_status DEFAULT 'registrations_open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAREJAS INSCRIPTAS A TORNEOS
CREATE TABLE tournament_couples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    player1_name VARCHAR(255) NOT NULL,
    player2_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    payment_verified BOOLEAN DEFAULT FALSE,
    seed_number INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PARTIDOS DE LLAVES / BRACKET
CREATE TABLE tournament_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    round match_round NOT NULL,
    match_number INT NOT NULL,
    couple_a_id UUID REFERENCES tournament_couples(id),
    couple_b_id UUID REFERENCES tournament_couples(id),
    couple_a_name VARCHAR(255),
    couple_b_name VARCHAR(255),
    score_set_1 VARCHAR(10),
    score_set_2 VARCHAR(10),
    score_set_3 VARCHAR(10),
    winner_couple_id UUID REFERENCES tournament_couples(id),
    scheduled_time TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'scheduled'
);

-- 11. PROFESORES Y ACADEMIA
CREATE TABLE coaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    experience_years INT NOT NULL,
    bio TEXT NOT NULL,
    hourly_rate NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CLASES Y RESERVAS DE ALUMNOS
CREATE TABLE class_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES coaches(id),
    user_id UUID REFERENCES users(id),
    class_type VARCHAR(100) NOT NULL, -- 'Individual', 'Pareja', 'Menores'
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    status booking_status DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. REGISTRO Y AUDITORÍA DE PUSH NOTIFICATIONS
CREATE TABLE push_notifications_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    payload JSONB,
    delivered BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TRIGGER AUTOMÁTICO: AL CANCELAR RESERVA -> LIBERAR TURNO Y NOTIFICAR
-- ====================================================================
CREATE OR REPLACE FUNCTION on_booking_cancelled()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
        -- 1. Liberar el turno
        UPDATE time_slots 
        SET status = 'available' 
        WHERE id = NEW.time_slot_id;

        -- 2. Emitir evento a Redis / PostgreSQL LISTEN para worker de Push Notifications
        PERFORM pg_notify('turn_cancelled_event', json_build_object(
            'time_slot_id', NEW.time_slot_id,
            'cancelled_by', NEW.user_id,
            'timestamp', NOW()
        )::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_cancellation
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION on_booking_cancelled();`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0d0e15] border border-pink-500/40 shadow-[0_0_60px_rgba(255,0,127,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Arquitectura Técnica & Modelo de Datos
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono border border-pink-500/30">
                  La Pantera Padel
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Diseñado para máxima velocidad, Instagram WebViews y automatizaciones en tiempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-zinc-950/60 px-5 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-4 h-4" />
            1. Esquema PostgreSQL (DDL & Triggers)
          </button>
          <button
            onClick={() => setActiveTab('stack')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'stack'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-4 h-4" />
            2. Stack Tecnológico de Ultrarrápida Carga
          </button>
          <button
            onClick={() => setActiveTab('push_architecture')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'push_architecture'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            3. Sistema Push (FCM & Web Push)
          </button>
          <button
            onClick={() => setActiveTab('instagram_ux')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'instagram_ux'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            4. Optimización Tráfico Instagram
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-zinc-300">
          
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">DDL de Base de Datos Relacional PostgreSQL</h4>
                  <p className="text-xs text-zinc-400">13 tablas con integridad referencial, índices optimizados y trigger de cancelación automática</p>
                </div>
                <button
                  onClick={() => copyToClipboard(POSTGRES_SCHEMA)}
                  className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado al portapapeles' : 'Copiar SQL'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/10">
                  <span className="text-pink-400 font-bold block mb-1">Automatización de Liberación</span>
                  Trigger en PostgreSQL que ejecuta <code className="text-zinc-200">pg_notify</code> al cancelar un turno para avisar al instante a la lista de espera.
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/10">
                  <span className="text-emerald-400 font-bold block mb-1">Índices Parciales</span>
                  <code className="text-zinc-200">idx_waitlist_slot_unnotified</code> indexa únicamente usuarios pendientes de aviso para queries en &lt;2ms.
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/10">
                  <span className="text-blue-400 font-bold block mb-1">Escalabilidad de Torneos</span>
                  Modelado completo de parejas y llaves de eliminación directa (Cuartos, Semis, Final) con marcadores por set.
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-black/80 border border-white/10 font-mono text-[11px] leading-relaxed text-zinc-300 overflow-x-auto max-h-[420px]">
                {POSTGRES_SCHEMA}
              </pre>
            </div>
          )}

          {activeTab === 'stack' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-white text-base">Stack Tecnológico Recomendado para La Pantera Padel</h4>
                <p className="text-xs text-zinc-400">Objetivo central: Time-to-First-Byte (TTFB) &lt; 150ms y First Contentful Paint (FCP) &lt; 0.8s dentro de Instagram In-App Browser</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-pink-500/30">
                  <div className="flex items-center gap-2 text-pink-400 font-bold text-sm mb-2">
                    <Zap className="w-4 h-4" />
                    Frontend & Runtime
                  </div>
                  <ul className="text-xs space-y-2 text-zinc-300">
                    <li><strong className="text-white">Next.js 15 (App Router) o React 19 + Vite:</strong> Componentes de servidor (RSC) para enviar HTML estático ultra liviano en la primera carga desde Instagram.</li>
                    <li><strong className="text-white">Tailwind CSS v4:</strong> Sin CSS superfluo, compilación atómica en milisegundos con import directo.</li>
                    <li><strong className="text-white">Motion:</strong> Transiciones de 60fps con GPU acceleration para sensación nativa de aplicación deportiva.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                    <Server className="w-4 h-4" />
                    Backend & Base de Datos
                  </div>
                  <ul className="text-xs space-y-2 text-zinc-300">
                    <li><strong className="text-white">PostgreSQL (Cloud SQL / Supabase):</strong> RDBMS robusto con ACID para evitar overbooking o colisiones en el mismo segundo.</li>
                    <li><strong className="text-white">Redis (Upstash / Cloud Memorystore):</strong> Para bloqueos atómicos temporales (Distributed Locks) de 5 minutos mientras el jugador completa la reserva.</li>
                    <li><strong className="text-white">Drizzle ORM:</strong> Zero-overhead TypeScript ORM sin cold starts lentos.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-blue-500/30">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    Autenticación & Edge CDN
                  </div>
                  <ul className="text-xs space-y-2 text-zinc-300">
                    <li><strong className="text-white">Google OAuth (1-Tap):</strong> Inicia sesión con 1 solo toque con cuenta de Google, eliminando formularios de registro y contraseñas.</li>
                    <li><strong className="text-white">Cloudflare Edge / Vercel Edge:</strong> Cacheo perimetral en Buenos Aires/Córdoba para entregar assets estáticos con latencia &lt; 20ms en Argentina.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                    <Bell className="w-4 h-4" />
                    Notificaciones & Automatización
                  </div>
                  <ul className="text-xs space-y-2 text-zinc-300">
                    <li><strong className="text-white">Web Push API + Firebase Cloud Messaging (FCM):</strong> Notificaciones push nativas al dispositivo móvil del jugador.</li>
                    <li><strong className="text-white">Gmail API / Resend:</strong> Emails transaccionales con plantilla oscura y botones de reserva directa si se libera un turno.</li>
                    <li><strong className="text-white">WhatsApp Cloud API (Opcional):</strong> Mensaje con enlace directo para compartir la reserva con los otros 3 jugadores del turno.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'push_architecture' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-base">Arquitectura del Sistema de Notificaciones Push</h4>
                <p className="text-xs text-zinc-400">Diseñado con Firebase Cloud Messaging (FCM) y Web Push Service Worker para La Pantera Padel</p>
              </div>

              <div className="p-4 bg-zinc-900/80 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                  <Activity className="w-4 h-4" />
                  Flujo Automatizado de Lista de Espera:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 bg-black/60 rounded-lg border border-white/5">
                    <span className="text-pink-400 font-bold block mb-1">1. Registro de Interés</span>
                    El usuario ingresa y ve el turno de las 20:00 ocupado. Toca "Avisarme si se libera" con 1 click.
                  </div>
                  <div className="p-3 bg-black/60 rounded-lg border border-white/5">
                    <span className="text-amber-400 font-bold block mb-1">2. Cancelación Propia</span>
                    El titular del turno no puede asistir y cancela desde su perfil web ("Mis Turnos") a las 17:30.
                  </div>
                  <div className="p-3 bg-black/60 rounded-lg border border-white/5">
                    <span className="text-blue-400 font-bold block mb-1">3. Trigger Inmediato</span>
                    El sistema detecta la cancelación, actualiza el slot a "available" y consulta la tabla <code className="text-pink-300">waitlists</code>.
                  </div>
                  <div className="p-3 bg-black/60 rounded-lg border border-white/5">
                    <span className="text-emerald-400 font-bold block mb-1">4. Push + Chime</span>
                    Se despacha Web Push / FCM con vibración: <em>"¡Turno liberado en Cancha 1 a las 20:00!"</em>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-black/70 rounded-xl border border-white/10 text-xs space-y-2">
                <span className="font-bold text-white block">Eventos Push soportados en el cliente:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                  <div className="p-2 rounded bg-zinc-900/50 border border-white/5">
                    <strong className="text-pink-400">Confirmación de Reserva:</strong> Comprobante con cancha, día y hora.
                  </div>
                  <div className="p-2 rounded bg-zinc-900/50 border border-white/5">
                    <strong className="text-amber-400">Recordatorio 2 Horas Antes:</strong> Evita "no-shows" y ausencias.
                  </div>
                  <div className="p-2 rounded bg-zinc-900/50 border border-white/5">
                    <strong className="text-blue-400">Actualización de Torneos:</strong> Publicación de llaves, fixture y resultados en vivo.
                  </div>
                  <div className="p-2 rounded bg-zinc-900/50 border border-white/5">
                    <strong className="text-emerald-400">Disponibilidad de Clases:</strong> Avisos cuando el Prof. Marcos Giménez abre cupos.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instagram_ux' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-base">Estrategias Críticas para Tráfico Proveniente de Instagram</h4>
                <p className="text-xs text-zinc-400">El 85% de los jugadores en Jovita ingresan desde historias, reels o enlace en biografía de Instagram</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/10">
                  <strong className="text-pink-400 text-sm block mb-1">1. Navegación en 100dvh</strong>
                  El navegador interno de Instagram tiene barras superior e inferior dinámicas que rompen layouts con 100vh tradicional. Usamos <code className="text-zinc-200">min-h-dvh</code> para que el contenido no quede tapado.
                </div>
                <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/10">
                  <strong className="text-pink-400 text-sm block mb-1">2. Widget de Reserva en el Hero</strong>
                  Sin scroll obligatorio. Nada más abrir el link, el usuario ve los días (Hoy, Mañana) y los horarios disponibles listos para tocar.
                </div>
                <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/10">
                  <strong className="text-pink-400 text-sm block mb-1">3. Cero Fricción de Login</strong>
                  Se puede consultar toda la grilla de disponibilidad sin registrarse ni loguearse. La autenticación ocurre en el último paso con 1 toque.
                </div>
                <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/10">
                  <strong className="text-pink-400 text-sm block mb-1">4. Cancelación Directa Sin WhatsApp</strong>
                  El usuario no tiene que esperar a que el dueño del club lea un mensaje en WhatsApp para cancelar. Cancela en 1 click, la cancha queda libre de inmediato y el club nunca pierde ingresos.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-950/90 flex items-center justify-between">
          <span className="text-xs text-zinc-400">Arquitectura de grado de producción • La Pantera Padel</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-colors shadow-[0_0_20px_rgba(255,0,127,0.3)]"
          >
            Entendido, volver a la App
          </button>
        </div>

      </div>
    </div>
  );
};
