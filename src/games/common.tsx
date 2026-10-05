import { useEffect, useState } from "react";
import { Trophy, RotateCcw, Timer } from "lucide-react";

export type GameProps = {
  onComplete: (score?: number, label?: string) => void;
  config?: Record<string, any>;
  photo?: string;
};

export function useElapsed(running: boolean) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  return { secs, setSecs };
}

export function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${r.toString().padStart(2, "0")}` : `${r}s`;
}

export function WinBanner({ title, subtitle, score, onRestart }: { title: string; subtitle: string; score?: string; onRestart: () => void }) {
  return (
    <div className="animate-pop-in rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-5 text-center">
      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Trophy className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-black text-emerald-900">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-emerald-800">{subtitle}</p>
      {score && (
        <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-black text-emerald-900 shadow-sm">
          <Timer className="h-4 w-4" /> {score}
        </div>
      )}
      <div className="mt-4 flex justify-center">
        <button onClick={onRestart} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50">
          <RotateCcw className="h-4 w-4" /> Torna-ho a provar
        </button>
      </div>
    </div>
  );
}

export function GameHeader({ instruction, secs, extra }: { instruction: string; secs?: number; extra?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 text-left">
      <p className="flex-1 rounded-xl bg-amber-50 px-3 py-2 text-[13px] font-semibold leading-snug text-stone-700 ring-1 ring-amber-200">{instruction}</p>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {typeof secs === "number" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-900 px-3 py-1 text-xs font-black tabular-nums text-white">
            <Timer className="h-3.5 w-3.5" /> {formatTime(secs)}
          </span>
        )}
        {extra}
      </div>
    </div>
  );
}

/* ---------- Emojis: compatibilitat amb mòbils antics ---------- */

export const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';
/** Emojis antics i compatibles amb qualsevol mòbil (per substituir els que no es poden pintar). */
export const SAFE_EMOJIS = ["🍎", "🐱", "⭐", "🚗", "🎈", "🌳", "🍕", "⚽", "🎵", "🐶"];

const emojiCache = new Map<string, boolean>();

/** Comprova si aquest dispositiu sap dibuixar l'emoji (si no, surt un quadrat buit o res). */
export function emojiSupported(e: string): boolean {
  if (!e || /^[\x00-\x7F]*$/.test(e)) return true; // text normal: sempre es veu
  const cached = emojiCache.get(e);
  if (cached !== undefined) return cached;
  let ok = true;
  try {
    const c = document.createElement("canvas");
    c.width = 40;
    c.height = 40;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = `28px ${EMOJI_FONT}`;
      ctx.fillText(e, 2, 2);
      const d = ctx.getImageData(0, 0, 40, 40).data;
      let painted = false;
      let colored = false;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 0) {
          painted = true;
          if (Math.abs(d[i] - d[i + 1]) > 12 || Math.abs(d[i + 1] - d[i + 2]) > 12) { colored = true; break; }
        }
      }
      ok = painted && colored; // un emoji real és de colors; el quadrat buit és negre
    }
  } catch {
    ok = true;
  }
  emojiCache.set(e, ok);
  return ok;
}

/** Si el dispositiu no sap pintar l'emoji, retorna el de reserva. */
export function safeEmoji(e: string, fallback: string): string {
  if (!emojiSupported("🍎")) return e; // la detecció no és fiable en aquest navegador
  return emojiSupported(e) ? e : fallback;
}

/** Llista d'emojis sense repetits i que el dispositiu sap pintar. Completa amb emojis segurs si en falta. */
export function safeEmojiList(list: string[], count: number): string[] {
  const base = list.slice(0, count);
  if (!emojiSupported("🍎")) return base;
  const out: string[] = [];
  list.forEach((e) => { if (out.length < count && !out.includes(e) && emojiSupported(e)) out.push(e); });
  for (const s of SAFE_EMOJIS) { if (out.length >= count) break; if (!out.includes(s)) out.push(s); }
  return out.slice(0, count);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
