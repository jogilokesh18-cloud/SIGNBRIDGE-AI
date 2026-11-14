import React, { useState } from 'react';
import { Send, Mic, Sparkles, User, Bot, Volume2, ShieldAlert } from 'lucide-react';
import { useAuraStore } from '../../store/auraStore.js';
import { api } from '../../services/api.js';

export const StylistHUD: React.FC = () => {
  const {
    conversation,
    addMessage,
    isConsulting,
    setConsulting,
    bodyScan,
    activeGarment,
    setActiveGarment,
    sentiment
  } = useAuraStore();

  const [inputPrompt, setInputPrompt] = useState('');

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user' as const,
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    addMessage(userMsg);
    setInputPrompt('');
    setConsulting(true);

    try {
      const reply = await api.consultStylist({
        user_prompt: promptText,
        body_analysis: bodyScan || undefined,
        active_tryon_id: activeGarment?.id
      });

      addMessage(reply);

      // Auto-drape first recommended garment
      if (reply.recommended_garments && reply.recommended_garments.length > 0) {
        setActiveGarment(reply.recommended_garments[0]);
      }
    } catch (err) {
      console.error('Stylist consultation failed:', err);
      addMessage({
        id: `err-${Date.now()}`,
        sender: 'stylist',
        text: 'The silhouette looks exceptional. The drape accentuates your posture with tailored ease.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setConsulting(false);
    }
  };

  const latestStylistMsg = [...conversation].reverse().find((m) => m.sender === 'stylist');

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
      {/* Header: Stylist ID & Affective Sentiment */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Aura Private Concierge
            </h3>
            <span className="text-[10px] text-amber-400/90 font-mono">
              Milan Haute Couture Engine v2.4
            </span>
          </div>
        </div>

        {/* Real-time Affective Sentiment Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Mood: <strong className="text-white capitalize">{sentiment.mood}</strong> ({Math.round(sentiment.energy_score * 100)}%)</span>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
        {conversation.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 text-xs ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'stylist' && (
              <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                A
              </div>
            )}
            <div
              className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-400 text-slate-950 font-semibold rounded-tr-none'
                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                U
              </div>
            )}
          </div>
        ))}

        {isConsulting && (
          <div className="flex items-center gap-2 text-xs text-amber-400/80 italic p-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Aura is analyzing drape physics and silhouette harmony...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      {latestStylistMsg?.suggested_prompts && latestStylistMsg.suggested_prompts.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Quick Inquiries:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {latestStylistMsg.suggested_prompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(prompt)}
                className="text-[11px] px-3 py-1 rounded-lg bg-white/5 hover:bg-amber-400/20 text-slate-300 hover:text-amber-200 border border-white/10 hover:border-amber-400/30 transition-colors text-left"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(inputPrompt);
        }}
        className="flex items-center gap-2 pt-2 border-t border-white/10"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask Aura to drape, adjust fit, or restyle..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isConsulting}
          className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
