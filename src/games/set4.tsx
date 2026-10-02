import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { GameProps, GameHeader, WinBanner } from "./common";

/* =====================================================
   TIRA I ARRONSA: toca ràpid per estirar la corda
   ===================================================== */
export function GameTug({ onComplete, config }: GameProps) {
  const OPP = config?.opponent || "🍌";
  const [pos, setPos] = useState(50); // 0 = guanya el rival · 100 = guanyes tu
  const [phase, setPhase] = useState<"idle" | "play" | "won" | "lost">("idle");
  const [taps, setTaps] = useState(0);
  const posRef = useRef(50);
  const phaseRef = useRef<"idle" | "play" | "won" | "lost">("idle");

  const end = (r: "won" | "lost") => {
    phaseRef.current = r;
    setPhase(r);
    if (r === "won") onComplete(500, "guanyat");
  };

  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => {
      if (phaseRef.current !== "play") return;
      const pull = 0.8 + Math.random() * 1.1 + (Math.random() < 0.08 ? 2.5 : 0);
      posRef.current = Math.max(0, posRef.current - pull);
      setPos(posRef.current);
      if (posRef.current <= 0) end("lost");
    }, 100);
    return () => clearInterval(t);
  }, [phase]);

  const tap = () => {
    if (phaseRef.current !== "play") return;
    posRef.current = Math.min(100, posRef.current + 3.8);
    setPos(posRef.current);
    setTaps((t) => t + 1);
    if (posRef.current >= 100) end("won");
  };
  const start = () => {
    posRef.current = 50;
    setPos(50);
    setTaps(0);
    phaseRef.current = "play";
    setPhase("play");
  };

  return (
    <div>
      <GameHeader
        instruction="Toca el botó el més ràpid que puguis per estirar la corda cap a la teva banda!"
        extra={<span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800">💪 {taps} tocs</span>}
      />
      <div className="relative mx-auto h-24 w-full max-w-[340px] overflow-hidden rounded-2xl ring-1 ring-stone-200">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-red-100" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-emerald-100" />
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded bg-amber-700/70" />
        <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-stone-400/60" />
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-3xl">{OPP}</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-3xl">🧑</span>
        {/* Línies de meta: quan la corda les toca, s'acaba */}
        <div className="absolute inset-y-0 left-[18%] w-0.5 bg-red-400/70" />
        <div className="absolute inset-y-0 right-[18%] w-0.5 bg-emerald-500/70" />
        <span
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl"
          style={{ left: `${18 + Math.min(100, Math.max(0, pos)) * 0.64}%`, transition: "left 80ms linear" }}
        >
          🪢
        </span>
      </div>
      <div className="mx-auto mt-1 flex max-w-[340px] justify-between text-[10px] font-black uppercase text-stone-400">
        <span>Rival</span>
        <span>Tu</span>
      </div>

      {phase === "idle" && (
        <button onClick={start} className="mt-4 w-full rounded-2xl bg-rose-500 py-4 text-lg font-black text-white shadow-md active:scale-[0.98]">
          Som-hi! 💪
        </button>
      )}
      {phase === "play" && (
        <button
          onPointerDown={tap}
          style={{ touchAction: "manipulation", WebkitUserSelect: "none", userSelect: "none" }}
          className="mt-4 w-full select-none rounded-2xl bg-rose-500 py-10 text-3xl font-black text-white shadow-lg active:scale-[0.97] active:bg-rose-600"
        >
          💪 TIRA!
        </button>
      )}
      {phase === "won" && (
        <div className="mt-4">
          <WinBanner title="Has guanyat la baralla! 🏆" subtitle={`Has estirat amb ${taps} tocs.`} score={`${taps} tocs`} onRestart={start} />
        </div>
      )}
      {phase === "lost" && (
        <div className="mt-4 rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-center">
          <h3 className="text-xl font-black text-red-800">T'ha arrossegat! {OPP}</h3>
          <p className="mt-1 text-sm font-bold text-red-700">Toca més ràpid, ho tens a prop.</p>
          <button onClick={start} className="mt-3 rounded-xl bg-red-600 px-5 py-2 font-bold text-white">
            Torna-ho a provar
          </button>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   TORRE DE BLOCS: apila 10 blocs sense que caigui
   ===================================================== */
const ROW = 26;
const GOAL = 10;
const STACK_COLORS = ["#ffd93d", "#6bcb77", "#4d96ff", "#ff6b6b", "#b983ff"];
type Block = { x: number; w: number };

export function GameStack({ onComplete }: GameProps) {
  const [blocks, setBlocks] = useState<Block[]>([{ x: 30, w: 40 }]);
  const [mx, setMx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "play" | "won" | "lost">("idle");
  const mxRef = useRef(0);
  const dirRef = useRef(1);
  const top = blocks[blocks.length - 1];
  const level = blocks.length;

  useEffect(() => {
    if (phase !== "play") return;
    let raf = 0;
    let last = performance.now();
    const speed = 28 + level * 4; // % per segon
    const maxX = 100 - top.w;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let n = mxRef.current + dirRef.current * speed * dt;
      if (n >= maxX) { n = maxX; dirRef.current = -1; }
      if (n <= 0) { n = 0; dirRef.current = 1; }
      mxRef.current = n;
      setMx(n);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, level]);

  const start = () => {
    mxRef.current = 0;
    dirRef.current = 1;
    setMx(0);
    setBlocks([{ x: 30, w: 40 }]);
    setPhase("play");
  };

  const drop = () => {
    if (phase !== "play") return;
    const x = mxRef.current;
    const w = top.w;
    const l = Math.max(x, top.x);
    const r = Math.min(x + w, top.x + top.w);
    let ow = r - l;
    if (ow < 2) { setPhase("lost"); return; }
    let nx = l;
    if (Math.abs(x - top.x) < 2.5) { nx = top.x; ow = top.w; } // perfecte: no es perd amplada
    const nb = [...blocks, { x: nx, w: ow }];
    setBlocks(nb);
    if (nb.length >= GOAL) {
      setPhase("won");
      onComplete(600, `${GOAL} blocs`);
    }
  };

  return (
    <div>
      <GameHeader
        instruction="Toca per deixar caure el bloc just a sobre de l'anterior. Si sobresurt, es talla! Apila 10 blocs."
        extra={<span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-800">🧱 {blocks.length - 1}/{GOAL - 1}</span>}
      />
      <div
        className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl bg-sky-100 ring-1 ring-sky-200"
        style={{ height: (GOAL + 1) * ROW + 8 }}
      >
        {blocks.map((b, i) => (
          <div key={i} className="absolute rounded-md shadow-sm" style={{ left: `${b.x}%`, width: `${b.w}%`, bottom: 4 + i * ROW, height: ROW - 2, background: STACK_COLORS[i % 5] }} />
        ))}
        {phase === "play" && (
          <div className="absolute rounded-md" style={{ left: `${mx}%`, width: `${top.w}%`, bottom: 4 + blocks.length * ROW, height: ROW - 2, background: STACK_COLORS[blocks.length % 5], opacity: 0.92 }} />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-700/60" />
      </div>

      {phase === "idle" && (
        <button onClick={start} className="mt-4 w-full rounded-2xl bg-indigo-500 py-4 text-lg font-black text-white shadow-md active:scale-[0.98]">
          Comença a construir 🧱
        </button>
      )}
      {phase === "play" && (
        <button
          onPointerDown={drop}
          style={{ touchAction: "manipulation", WebkitUserSelect: "none", userSelect: "none" }}
          className="mt-4 w-full select-none rounded-2xl bg-indigo-500 py-6 text-2xl font-black text-white shadow-lg active:scale-[0.98] active:bg-indigo-600"
        >
          ⬇ DEIXA CAURE
        </button>
      )}
      {phase === "won" && (
        <div className="mt-4">
          <WinBanner title="Torre acabada! 🏗️" subtitle="Has apilat els 10 blocs." score={`${GOAL} blocs`} onRestart={start} />
        </div>
      )}
      {phase === "lost" && (
        <div className="mt-4 rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-center">
          <h3 className="text-xl font-black text-red-800">S'ha ensorrat la torre!</h3>
          <p className="mt-1 text-sm font-bold text-red-700">Portaves {blocks.length - 1} blocs. Prova-ho un altre cop.</p>
          <button onClick={start} className="mt-3 rounded-xl bg-red-600 px-5 py-2 font-bold text-white">
            Torna-ho a provar
          </button>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   RASCA I GUANYA: rasca la capa de plata
   ===================================================== */
export function GameScratch({ onComplete, config }: GameProps) {
  const secret = String(config?.secret || "💛");
  const label = String(config?.label || "Rasca per descobrir el que hi ha amagat");
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const lastCheck = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [pct, setPct] = useState(0);
  const doneRef = useRef(false);

  // Dibuixa la capa de plata
  useEffect(() => {
    const c = canvasRef.current;
    const box = boxRef.current;
    if (!c || !box) return;
    const dpr = window.devicePixelRatio || 1;
    const w = box.clientWidth;
    const h = box.clientHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#c4c4d2");
    g.addColorStop(0.5, "#f0f0f6");
    g.addColorStop(1, "#b2b2c4");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 110; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,.55)" : "rgba(120,120,140,.25)";
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2.2 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#6b6c80";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ RASCA AQUÍ ✨", w / 2, h / 2);
  }, [resetKey]);

  const measure = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return 0;
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < d.length; i += 48) {
      total++;
      if (d[i] < 40) clear++;
    }
    return total ? clear / total : 0;
  };

  const maybeReveal = (force = false) => {
    const now = Date.now();
    if (!force && now - lastCheck.current < 250) return;
    lastCheck.current = now;
    const p = measure();
    setPct(Math.round(p * 100));
    if (p >= 0.5 && !doneRef.current) {
      doneRef.current = true;
      setRevealed(true);
      onComplete(300, "rascat");
    }
  };

  const scratchTo = (e: RPointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || !drawing.current || revealed) return;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 42;
    ctx.beginPath();
    const lp = lastPt.current;
    ctx.moveTo(lp ? lp.x : x, lp ? lp.y : y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPt.current = { x, y };
    maybeReveal();
  };

  const down = (e: RPointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    lastPt.current = null;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignorat */ }
    scratchTo(e);
  };
  const up = () => {
    drawing.current = false;
    lastPt.current = null;
    if (!revealed) maybeReveal(true);
  };
  const reset = () => {
    doneRef.current = false;
    setRevealed(false);
    setPct(0);
    setResetKey((k) => k + 1);
  };

  return (
    <div>
      <GameHeader instruction={`${label}. Passa el dit per sobre fins que aparegui!`} extra={<span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">{revealed ? "100" : pct}% rascat</span>} />
      <div ref={boxRef} className="relative mx-auto h-44 w-full max-w-[340px] overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 ring-2 ring-amber-300">
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
          <span className="whitespace-pre-line text-3xl font-black leading-tight text-stone-800">{secret}</span>
        </div>
        <canvas
          key={resetKey}
          ref={canvasRef}
          onPointerDown={down}
          onPointerMove={scratchTo}
          onPointerUp={up}
          onPointerCancel={up}
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${revealed ? "pointer-events-none opacity-0" : "opacity-100"}`}
          style={{ touchAction: "none", cursor: "crosshair" }}
        />
      </div>
      {revealed ? (
        <div className="mt-4">
          <WinBanner title="Descobert! ✨" subtitle="Has rascat la capa de plata." onRestart={reset} />
        </div>
      ) : (
        <p className="mt-3 text-center text-xs font-bold text-stone-400">Rasca més de la meitat per revelar-ho</p>
      )}
    </div>
  );
}
