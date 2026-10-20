import React, { useState, useEffect } from 'react';
import { Trophy, Award, Users, Calendar, Sparkles, Check, ChevronRight, Activity, Flame, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Tournament } from '../types';
import { StorageService } from '../services/storageService';

interface Props {
  refreshTrigger?: number;
}

export const TournamentsSection: React.FC<Props> = ({ refreshTrigger }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>(StorageService.getTournaments());
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(tournaments[0] || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLiveBracket, setShowLiveBracket] = useState(true);

  // Form State
  const [player1, setPlayer1] = useState('Tisiano Vera');
  const [player2, setPlayer2] = useState('');
  const [phone, setPhone] = useState('03385 43-0525');
  const [email, setEmail] = useState('tisianovera.4@gmail.com');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const [registrationError, setRegistrationError] = useState<string | null>(null);

  useEffect(() => {
    const list = StorageService.getTournaments();
    setTournaments(list);
    setSelectedTournament((prev) => {
      if (!prev) return list[0] || null;
      const found = list.find(t => t.id === prev.id);
      return found || list[0] || null;
    });
  }, [refreshTrigger]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1 || !player2 || !selectedTournament) return;
    setRegistrationError(null);

    const res = StorageService.registerTournamentCouple({
      tournamentId: selectedTournament.id,
      player1,
      player2,
      phone,
      email,
    });

    if (!res.success) {
      setRegistrationError(res.error || 'No se pudo completar la inscripción.');
      return;
    }

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        colors: ['#ff007f', '#0f172a', '#3b82f6'],
      });
    } catch {}

    setRegisteredSuccess(true);
    setTournaments(StorageService.getTournaments());
    setTimeout(() => {
      setIsRegistering(false);
      setRegisteredSuccess(false);
    }, 2200);
  };

  const bracket = selectedTournament?.bracket;

  return (
    <section id="torneos" className="py-16 md:py-24 relative bg-white border-t border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 border border-pink-300 text-pink-700 text-xs font-bold uppercase mb-3">
              <Trophy className="w-4 h-4" />
              Circuito Oficial Pantera
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 uppercase tracking-tight">
              TORNEOS Y COMPETENCIAS EN VIVO
            </h2>
            <p className="text-base text-zinc-600 mt-2 max-w-xl">
              Sigue las llaves y marcadores punto a punto en tiempo real. Inscribe tu pareja en las diferentes categorías y sumas.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowLiveBracket(!showLiveBracket)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                showLiveBracket
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'bg-slate-100 border border-zinc-200 text-zinc-700'
              }`}
            >
              <Activity className="w-4 h-4 text-pink-500" />
              {showLiveBracket ? 'Ocultar Llaves en Vivo' : 'Ver Llaves en Vivo'}
            </button>
          </div>
        </div>

        {/* Tournament Cards Carousel / Selector */}
        {tournaments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-3xl border border-zinc-200 text-zinc-500">
            No hay torneos activos en este momento. Puedes crearlos desde el Panel de Admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {tournaments.map((t) => {
              const isSelected = selectedTournament?.id === t.id;
              const isEnCurso = t.status === 'en_curso';
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTournament(t)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-pink-500 shadow-xl ring-2 ring-pink-500/20'
                      : 'bg-slate-50 border-zinc-200 hover:border-zinc-300 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-pink-100 text-pink-800 uppercase tracking-wider">
                        {t.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                        isEnCurso
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}>
                        {isEnCurso && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />}
                        {isEnCurso ? 'En Vivo' : 'Inscripción Abierta'}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-zinc-900">{t.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {t.startDate} - {t.endDate}
                    </p>

                    <div className="mt-4 p-3.5 rounded-2xl bg-white border border-zinc-200 space-y-1.5 text-xs shadow-xs">
                      <div className="text-pink-600 font-bold flex items-center gap-1.5">
                        <Award className="w-4 h-4 shrink-0" />
                        <span>{t.prizes}</span>
                      </div>
                      <div className="text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-100">
                        <span>Cupos ocupados:</span>
                        <strong className="text-zinc-900">{t.registeredCouplesCount} / {t.totalSlots} parejas</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-200 flex gap-2">
                    {t.status === 'inscripciones_abiertas' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTournament(t);
                          setIsRegistering(true);
                        }}
                        className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all"
                      >
                        Inscribir Pareja (${t.pricePerCouple.toLocaleString()})
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowLiveBracket(true)}
                        className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5 text-pink-400" />
                        Ver Cuadro en Vivo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIVE BRACKET VIEWER */}
        {showLiveBracket && bracket && selectedTournament && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-zinc-300 shadow-sm overflow-x-auto">
            
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200 min-w-[700px]">
              <div>
                <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-pink-600" />
                  Cuadro de Eliminación Directa • {selectedTournament.name}
                </h3>
                <p className="text-xs text-zinc-500">Actualización en tiempo real desde la mesa de control de La Pantera</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-pink-100 text-pink-800 rounded-full border border-pink-300">
                Categoría: {selectedTournament.category}
              </span>
            </div>

            {/* Bracket Columns: Cuartos -> Semis -> Final */}
            <div className="grid grid-cols-3 gap-6 min-w-[720px]">
              
              {/* Column 1: Cuartos */}
              <div className="space-y-4">
                <div className="text-xs font-black text-zinc-700 uppercase tracking-wider text-center py-1.5 bg-white border border-zinc-200 rounded-xl">
                  Cuartos de Final
                </div>

                {bracket.quarterFinals.map((match) => (
                  <div key={match.id} className="p-3 rounded-2xl bg-white border border-zinc-200 space-y-1.5 text-xs shadow-sm">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Partido #{match.matchNumber}</span>
                      <span>{match.scheduledTime}</span>
                    </div>

                    <div className={`p-2 rounded-xl flex items-center justify-between ${
                      match.winner === 'A' ? 'bg-pink-50 font-bold text-pink-900 border border-pink-300' : 'text-zinc-700'
                    }`}>
                      <span className="truncate">{match.teamA}</span>
                      {match.score?.set1 && (
                        <span className="text-[11px] font-mono ml-2 text-pink-600">
                          {match.score.set1.split('-')[0]} {match.score.set2?.split('-')[0]} {match.score.set3?.split('-')[0]}
                        </span>
                      )}
                    </div>

                    <div className={`p-2 rounded-xl flex items-center justify-between ${
                      match.winner === 'B' ? 'bg-pink-50 font-bold text-pink-900 border border-pink-300' : 'text-zinc-700'
                    }`}>
                      <span className="truncate">{match.teamB}</span>
                      {match.score?.set1 && (
                        <span className="text-[11px] font-mono ml-2 text-zinc-500">
                          {match.score.set1.split('-')[1]} {match.score.set2?.split('-')[1]} {match.score.set3?.split('-')[1]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2: Semifinales */}
              <div className="space-y-4 flex flex-col justify-around">
                <div className="text-xs font-black text-zinc-700 uppercase tracking-wider text-center py-1.5 bg-white border border-zinc-200 rounded-xl mb-2">
                  Semifinales
                </div>

                {bracket.semiFinals.map((match) => (
                  <div key={match.id} className="p-3.5 rounded-2xl bg-white border border-zinc-200 space-y-2 text-xs shadow-sm my-6">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Semi #{match.matchNumber}</span>
                      <span>{match.scheduledTime}</span>
                    </div>

                    <div className={`p-2 rounded-xl flex items-center justify-between ${
                      match.winner === 'A' ? 'bg-pink-50 font-bold text-pink-900 border border-pink-300' : 'text-zinc-700'
                    }`}>
                      <span className="truncate">{match.teamA}</span>
                      <span className="text-xs font-mono ml-2 text-pink-600 font-bold">6-3 4-6 6-3</span>
                    </div>

                    <div className={`p-2 rounded-xl flex items-center justify-between ${
                      match.winner === 'B' ? 'bg-pink-50 font-bold text-pink-900 border border-pink-300' : 'text-zinc-700'
                    }`}>
                      <span className="truncate">{match.teamB}</span>
                      <span className="text-xs font-mono ml-2 text-zinc-400">-</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 3: Gran Final */}
              <div className="flex flex-col justify-center">
                <div className="text-xs font-black text-pink-700 uppercase tracking-wider text-center py-1.5 bg-pink-100 border border-pink-300 rounded-xl mb-4 flex items-center justify-center gap-1.5">
                  <Trophy className="w-4 h-4 text-pink-600" />
                  Gran Final del Torneo
                </div>

                <div className="p-5 rounded-3xl bg-white border-2 border-pink-500 shadow-xl space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-pink-600 font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-pink-600 animate-ping" />
                      EN JUEGO AHORA
                    </span>
                    <span>Cancha La Pantera WPT</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-zinc-200">
                    <span className="text-sm font-black text-zinc-900 block">{bracket.finalMatch.teamA}</span>
                    <span className="text-[10px] text-zinc-500">Pareja #1 Ranking</span>
                  </div>

                  <div className="text-center font-mono font-black text-xl text-pink-600 bg-pink-50 py-2.5 rounded-2xl border border-pink-200">
                    {bracket.finalMatch.score?.set1} | {bracket.finalMatch.score?.set2}
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-zinc-200">
                    <span className="text-sm font-black text-zinc-900 block">{bracket.finalMatch.teamB}</span>
                    <span className="text-[10px] text-zinc-500">Pareja #2 Finalistas</span>
                  </div>

                  <div className="text-center text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
                    Premio: $450.000 + 2 Paletas Bullpadel Vertex
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* REGISTRATION MODAL */}
      {isRegistering && selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white border-2 border-pink-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-pink-600" />
                <h3 className="text-lg font-black text-zinc-900 uppercase">Inscripción a Torneo</h3>
              </div>
              <button onClick={() => setIsRegistering(false)} className="text-zinc-400 hover:text-zinc-700">✕</button>
            </div>

            {registeredSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-xl font-black text-zinc-900">¡Pareja Inscripta!</h4>
                <p className="text-xs text-zinc-500">Recibirán la confirmación y los cruces de partidos por Push y WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="py-4 space-y-3">
                {registrationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{registrationError}</span>
                  </div>
                )}

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-zinc-200 text-xs text-zinc-700">
                  <strong className="text-zinc-900 block text-sm">{selectedTournament.name}</strong>
                  <span>Categoría: {selectedTournament.category} • Costo: ${selectedTournament.pricePerCouple.toLocaleString()} por pareja</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase">Jugador 1 (Titular)</label>
                  <input
                    type="text"
                    required
                    value={player1}
                    onChange={(e) => setPlayer1(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase">Jugador 2 (Compañero)</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre y Apellido del compañero"
                    value={player2}
                    onChange={(e) => setPlayer2(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase">WhatsApp de Contacto</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-zinc-300 text-zinc-900 text-xs focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-zinc-700 font-bold text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase shadow-md cursor-pointer"
                  >
                    Confirmar Pareja
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
