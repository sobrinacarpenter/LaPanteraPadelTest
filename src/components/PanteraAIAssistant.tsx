import React, { useState } from 'react';
import { Sparkles, Send, Bot, X, MessageSquare, Zap } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

export const PanteraAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: '¡Hola! Soy Pantera AI 🐾. Pregúntame sobre la cancha, horarios libres, torneos oficiales o clases con el Prof. Tomás Villemur.',
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await GeminiService.askPanteraAI(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: '¡A calentar la muñeca! Puedes reservar turnos directamente en la sección superior o llamarnos al 03385 43-0525.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3.5 rounded-full bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 text-white shadow-[0_0_25px_rgba(255,0,127,0.5)] flex items-center gap-2 group transition-all active:scale-95 cursor-pointer"
          title="Asistente Padelero Pantera AI"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="hidden sm:inline text-xs font-black uppercase tracking-wider pr-1">
            Pantera AI
          </span>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-20 right-4 z-50 w-[92vw] sm:w-[380px] max-h-[500px] flex flex-col rounded-2xl bg-[#0f111a] border border-pink-500/40 shadow-[0_0_50px_rgba(255,0,127,0.3)] overflow-hidden animate-in slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="p-3.5 bg-zinc-900 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  Pantera AI
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </h4>
                <p className="text-[10px] text-zinc-400">Asistente Táctico & Reservas</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white text-sm">✕</button>
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-zinc-950/60 border-b border-white/5 flex gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => handleSend('¿Qué horarios me recomiendas para jugar hoy?')}
              className="px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:border-pink-500/40 whitespace-nowrap"
            >
              Horarios recomendados
            </button>
            <button
              onClick={() => handleSend('¿Cómo funciona la lista de espera automática?')}
              className="px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:border-pink-500/40 whitespace-nowrap"
            >
              Lista de espera
            </button>
            <button
              onClick={() => handleSend('¿Qué premios tiene el próximo torneo?')}
              className="px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:border-pink-500/40 whitespace-nowrap"
            >
              Premios de torneos
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-pink-600 text-white rounded-br-none'
                    : 'bg-zinc-900 border border-white/10 text-zinc-200 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="p-3 bg-zinc-900 rounded-2xl rounded-bl-none text-xs text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                <span>Analizando jugada...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-zinc-950 border-t border-white/10 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre canchas, táctica o clases..."
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-pink-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
