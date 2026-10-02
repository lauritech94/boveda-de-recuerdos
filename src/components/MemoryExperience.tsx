import { useEffect, useState } from "react";
import { X, Play, Sparkles, ArrowLeft, Heart, Lightbulb } from "lucide-react";
import confetti from "canvas-confetti";
import { EMOTIONS, Memory } from "../data/memories";
import { GAME_DEFS } from "../games/registry";
import { Sphere } from "./Sphere";

type Props = {
  memory: Memory;
  unlocked: boolean;
  unlockedCount: number;
  onUnlock: (label?: string) => void;
  onClose: () => void;
};

export function MemoryExperience({ memory: m, unlocked, unlockedCount, onUnlock, onClose }: Props) {
  const [phase, setPhase] = useState<"intro" | "game" | "reveal">(unlocked ? "reveal" : "intro");
  const [gameDone, setGameDone] = useState(false);
  const [pendingLabel, setPendingLabel] = useState<string | undefined>();
  const emo = EMOTIONS[m.emotion];
  const def = GAME_DEFS[m.gameKey];
  const Comp = def?.Comp;

  useEffect(() => {
    setPhase(unlocked ? "reveal" : "intro");
    setGameDone(false);
  }, [m.id]);

  const handleComplete = (_s?: number, label?: string) => {
    if (gameDone) return;
    setGameDone(true);
    setPendingLabel(label);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: [emo.color, "#fff", m.emotion2 ? EMOTIONS[m.emotion2].color : emo.color] });
  };

  const reveal = () => {
    onUnlock(pendingLabel);
    setPhase("reveal");
    setTimeout(() => confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 }, colors: [emo.color, "#ffffff", "#FFD23F"] }), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#07061a]/85 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="nice-scroll relative max-h-[96vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="relative overflow-hidden px-5 pb-4 pt-5 text-white" style={{ background: `linear-gradient(135deg, ${emo.color}, ${m.emotion2 ? EMOTIONS[m.emotion2].color : "#1b1838"})` }}>
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sphere emotion={m.emotion} emotion2={m.emotion2} size={56} photo={phase === "reveal" ? m.photo : undefined} />
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest opacity-80">Esfera {String(m.id).padStart(2, "0")} · {emo.name}{m.emotion2 ? ` + ${EMOTIONS[m.emotion2].name}` : ""}</p>
                <h2 className="text-xl font-black leading-tight drop-shadow">{phase === "intro" ? "Recuerdo bloqueado" : m.title}</h2>
                <p className="text-xs font-bold opacity-80">{m.when}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full bg-black/25 p-2 hover:bg-black/40"><X className="h-5 w-5" /></button>
          </div>
        </div>

        {/* INTRO */}
        {phase === "intro" && (
          <div className="px-5 py-6 text-center">
            <div className="mx-auto flex justify-center"><Sphere emotion={m.emotion} emotion2={m.emotion2} size={150} pulse /></div>
            <p className="mt-5 text-xs font-black uppercase tracking-widest text-stone-400">Pista</p>
            <p className="mx-auto mt-1 max-w-sm text-lg font-black leading-snug text-stone-800">“{m.hint}”</p>
            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold" style={{ background: emo.soft, color: emo.text }}>
              <Lightbulb className="h-4 w-4" /> Reto: {def?.name} · {def?.time}
            </div>
            <button onClick={() => setPhase("game")} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black text-stone-900 shadow-lg transition-transform active:scale-[0.98]" style={{ background: emo.color }}>
              <Play className="h-5 w-5" /> Superar el reto
            </button>
            <p className="mt-3 text-xs font-semibold text-stone-400">Al completarlo se revelará la foto y el mensaje de este recuerdo.</p>
          </div>
        )}

        {/* GAME */}
        {phase === "game" && (
          <div className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <button onClick={() => setPhase("intro")} className="inline-flex items-center gap-1 text-xs font-black text-stone-500 hover:text-stone-800"><ArrowLeft className="h-4 w-4" /> Pista</button>
              <span className="rounded-full px-3 py-1 text-[11px] font-black" style={{ background: emo.soft, color: emo.text }}>{def?.name}</span>
            </div>
            {Comp && <Comp key={m.id} onComplete={handleComplete} config={m.config} photo={m.photo} />}
            {gameDone && (
              <div className="sticky bottom-0 -mx-5 mt-4 bg-gradient-to-t from-white via-white to-transparent px-5 pb-4 pt-6">
                <button onClick={reveal} className="animate-pop-in inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black text-stone-900 shadow-xl" style={{ background: emo.color, boxShadow: `0 10px 30px ${emo.glow}` }}>
                  <Sparkles className="h-5 w-5" /> Desbloquear recuerdo
                </button>
              </div>
            )}
          </div>
        )}

        {/* REVEAL */}
        {phase === "reveal" && (
          <div className="animate-pop-in px-5 py-5">
            <div className="overflow-hidden rounded-2xl shadow-lg ring-4" style={{ ["--tw-ring-color" as any]: emo.color }}>
              {m.photo ? (
                <img src={m.photo} alt={m.title} className="max-h-[360px] w-full object-cover" />
              ) : (
                <div className="flex h-56 flex-col items-center justify-center gap-2 text-center" style={{ background: emo.soft, color: emo.text }}>
                  <span className="text-5xl">📷</span>
                  <p className="px-6 text-sm font-black">Aquí aparecerá la fotografía del recuerdo</p>
                  <p className="text-xs font-semibold opacity-70">Añádela desde el Panel de edición · Ficha #{m.id}</p>
                </div>
              )}
            </div>
            {m.photoCaption && <p className="mt-2 text-center text-xs font-bold text-stone-500">{m.photoCaption}</p>}
            <div className="mt-4 rounded-2xl p-4" style={{ background: emo.soft }}>
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest" style={{ color: emo.text }}><Heart className="h-3.5 w-3.5" /> Para ti</p>
              <p className="mt-2 whitespace-pre-line text-[15px] font-semibold leading-relaxed text-stone-800">{m.message}</p>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-stone-900 px-4 py-3 text-white">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-white/60">Colección</p>
                <p className="text-lg font-black">{unlockedCount}/30 recuerdos</p>
              </div>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full transition-all" style={{ width: `${(unlockedCount / 30) * 100}%`, background: emo.color }} /></div>
            </div>
            <button onClick={onClose} className="mt-3 w-full rounded-2xl bg-stone-100 py-3 font-black text-stone-700 hover:bg-stone-200">
              {unlockedCount >= 30 ? "✨ Ver el recuerdo final" : "Buscar otra esfera →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
