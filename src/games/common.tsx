import { useEffect, useRef, useState } from "react";
import { Trophy, RotateCcw, Timer, MousePointerClick } from "lucide-react";

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

export function WinBanner({
  title,
  subtitle,
  score,
  onRestart,
  onComplete,
}: {
  title: string;
  subtitle: string;
  score?: string;
  onRestart: () => void;
  onComplete?: () => void;
}) {
  return (
    <div className="animate-pop-in rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-5 text-center">
      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Trophy className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-black text-emerald-900">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-emerald-800">{subtitle}</p>
      {score && (
        <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-black text-emerald-900 shadow-sm">
          <Timer className="h-4 w-4" /> {score}
        </div>
      )}
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50"
        >
          <RotateCcw className="h-4 w-4" /> Reintentar
        </button>
        {onComplete && (
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <MousePointerClick className="h-4 w-4" /> Terminar prueba
          </button>
        )}
      </div>
    </div>
  );
}

export function GameHeader({
  instruction,
  secs,
  extra,
}: {
  instruction: string;
  secs?: number;
  extra?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <p className="flex-1 rounded-xl bg-amber-50 px-3 py-2 text-[13px] font-semibold leading-snug text-stone-700 ring-1 ring-amber-200">
        {instruction}
      </p>
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

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useNow() {
  const ref = useRef(Date.now());
  return ref.current;
}
