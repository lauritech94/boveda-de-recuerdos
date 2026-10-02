import { useEffect, useMemo, useRef, useState } from "react";
import { GameProps, GameHeader, WinBanner, useElapsed, shuffle, formatTime } from "./common";

/* 1 - ORDEN 1-30 */
export function GameOrder30({ onComplete }: GameProps) {
  const [nums] = useState(() => shuffle(Array.from({ length: 30 }, (_, i) => i + 1)));
  const [next, setNext] = useState(1);
  const [fails, setFails] = useState(0);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);
  const [shake, setShake] = useState<number | null>(null);

  const click = (n: number) => {
    if (won) return;
    if (n === next) {
      if (next === 30) {
        setNext(31);
        setWon(true);
        onComplete(1000 - secs * 5 - fails * 10, `${formatTime(secs)} · ${fails} fallos`);
      } else setNext(next + 1);
    } else if (n >= next) {
      setFails((f) => f + 1);
      setShake(n);
      setTimeout(() => setShake(null), 300);
    }
  };
  const doRestart = () => { setNext(1); setFails(0); setWon(false); };

  return (
    <div>
      <GameHeader instruction="Toca los números del 1 al 30 en orden. ¡Sin equivocarte!" secs={secs} extra={<span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800 ring-1 ring-orange-200">Siguiente: {next > 30 ? "✓" : next}</span>} />
      {!won ? (
        <>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${((next - 1) / 30) * 100}%` }} />
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
            {nums.map((n) => {
              const done = n < next;
              return (
                <button
                  key={n}
                  onClick={() => click(n)}
                  disabled={done}
                  className={`aspect-square rounded-xl text-lg font-black tabular-nums transition-all ${done ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300" : shake === n ? "animate-shake bg-red-500 text-white" : "bg-white text-stone-800 shadow-sm ring-1 ring-stone-200 hover:bg-orange-50 hover:ring-orange-300 active:scale-95"}`}
                >
                  {done ? "✓" : n}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs font-bold text-stone-500">Fallos: {fails} · Consejo: escanea en zig-zag visual, no busques uno por uno al azar.</p>
        </>
      ) : (
        <WinBanner title="¡Serie completada!" subtitle={`Lo hiciste en ${formatTime(secs)} con ${fails} fallos.`} score={`${formatTime(secs)}`} onRestart={doRestart} />
      )}
    </div>
  );
}

/* 2 - NONOGRAMA 5x5 */
const NONO_SOL = [
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];
function clues(line: number[]) {
  const res: number[] = [];
  let c = 0;
  line.forEach((v) => { if (v === 1) c++; else { if (c) res.push(c); c = 0; } });
  if (c) res.push(c);
  return res.length ? res : [0];
}
export function GameNonogram({ onComplete }: GameProps) {
  const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: 5 }, () => Array(5).fill(0)));
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const { secs } = useElapsed(!won);
  const rowClues = useMemo(() => NONO_SOL.map(clues), []);
  const colClues = useMemo(() => [0, 1, 2, 3, 4].map((c) => clues(NONO_SOL.map((r) => r[c]))), []);

  const toggle = (r: number, c: number) => {
    if (won) return;
    const ng = grid.map((row) => [...row]);
    ng[r][c] = (ng[r][c] + 1) % 3; // 0 vacio, 1 relleno, 2 X
    setGrid(ng);
    setMoves((m) => m + 1);
    const ok = NONO_SOL.every((row, rr) => row.every((v, cc) => (v === 1 ? ng[rr][cc] === 1 : ng[rr][cc] !== 1)));
    if (ok) { setWon(true); onComplete(500 - secs, `${moves} toques`); }
  };
  const reset = () => { setGrid(Array.from({ length: 5 }, () => Array(5).fill(0))); setWon(false); setMoves(0); };

  return (
    <div>
      <GameHeader instruction="Forma el corazón: toca para pintar ⬛, otra vez para ❌, otra para borrar. Pistas = bloques seguidos." secs={secs} />
      <div className="mx-auto max-w-[340px]">
        <div className="grid grid-cols-[44px_repeat(5,1fr)] gap-1">
          <div />
          {colClues.map((cl, i) => (
            <div key={i} className="flex min-h-[36px] flex-col items-center justify-end rounded-lg bg-stone-100 py-1 text-[11px] font-black leading-tight text-stone-700">{cl.join(" ")}</div>
          ))}
          {grid.map((row, r) => (
            <>
              <div key={`r${r}`} className="flex items-center justify-center rounded-lg bg-stone-100 px-1 text-[11px] font-black text-stone-700">{rowClues[r].join(" ")}</div>
              {row.map((v, c) => (
                <button key={`${r}-${c}`} onClick={() => toggle(r, c)} className={`aspect-square rounded-lg text-lg font-bold ring-1 transition-all active:scale-95 ${v === 1 ? "bg-stone-900 text-white ring-stone-900" : v === 2 ? "bg-white text-stone-300 ring-stone-200" : "bg-white ring-stone-200 hover:bg-amber-50"}`}>
                  {v === 2 ? "×" : ""}
                </button>
              ))}
            </>
          ))}
        </div>
        {!won ? (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">{moves} toques</span>
            <button onClick={reset} className="rounded-lg bg-stone-200 px-3 py-1.5 text-xs font-bold hover:bg-stone-300">Limpiar</button>
          </div>
        ) : (
          <div className="mt-3"><WinBanner title="¡Corazón revelado! ❤️" subtitle="Nonograma resuelto. ¡Lógica perfecta!" score={`${moves} toques`} onRestart={reset} /></div>
        )}
      </div>
    </div>
  );
}

/* 3 - PUZZLE DESLIZANTE */
function solvableShuffle(): number[] {
  let arr = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  for (let i = 0; i < 80; i++) {
    const z = arr.indexOf(0);
    const r = Math.floor(z / 3), c = z % 3;
    const opts: number[] = [];
    if (r > 0) opts.push(z - 3);
    if (r < 2) opts.push(z + 3);
    if (c > 0) opts.push(z - 1);
    if (c < 2) opts.push(z + 1);
    const s = opts[Math.floor(Math.random() * opts.length)];
    [arr[z], arr[s]] = [arr[s], arr[z]];
  }
  return arr;
}
export function GameSliding({ onComplete, config, photo }: GameProps) {
  const usePhoto = !!(photo && config?.usePhoto && String(config.usePhoto).toLowerCase() !== "false");
  const [tiles, setTiles] = useState<number[]>(() => solvableShuffle());
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);

  const move = (i: number) => {
    if (won) return;
    const z = tiles.indexOf(0);
    const r1 = Math.floor(i / 3), c1 = i % 3, r2 = Math.floor(z / 3), c2 = z % 3;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
      const nt = [...tiles];
      [nt[i], nt[z]] = [nt[z], nt[i]];
      setTiles(nt);
      setMoves((m) => m + 1);
      if (nt.every((v, idx) => v === [1, 2, 3, 4, 5, 6, 7, 8, 0][idx])) {
        setWon(true);
        onComplete(800 - moves * 5 - secs * 3, `${moves + 1} movs`);
      }
    }
  };
  const reset = () => { setTiles(solvableShuffle()); setMoves(0); setWon(false); };
  return (
    <div>
      <GameHeader instruction="Ordena del 1 al 8. Toca una ficha junto al hueco para moverla." secs={secs} extra={<span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800">{moves} movs</span>} />
      {!won ? (
        <div className="mx-auto grid max-w-[320px] grid-cols-3 gap-1.5 rounded-2xl bg-amber-100 p-2 ring-1 ring-amber-200">
          {tiles.map((t, i) => {
            const idx = t - 1;
            const style = usePhoto && t !== 0 ? { backgroundImage: `url(${photo})`, backgroundSize: "300% 300%", backgroundPosition: `${(idx % 3) * 50}% ${Math.floor(idx / 3) * 50}%` } : undefined;
            return (
              <button key={i} onClick={() => move(i)} style={style} className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xl text-3xl font-black ${t === 0 ? "bg-amber-100/50" : usePhoto ? "ring-2 ring-white shadow-sm active:scale-95" : "bg-white shadow-sm ring-1 ring-stone-200 hover:bg-orange-50 active:scale-95"}`}>
                {t !== 0 && (usePhoto ? <span className="absolute left-1 top-1 rounded bg-black/50 px-1.5 text-[10px] text-white">{t}</span> : t)}
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          {usePhoto && <img src={photo} alt="" className="mx-auto mb-3 max-h-56 rounded-2xl object-cover shadow-md" />}
          <WinBanner title="¡Puzzle ordenado!" subtitle={`En ${moves} movimientos y ${formatTime(secs)}.`} score={`${moves} movs`} onRestart={reset} />
        </div>
      )}
      {!won && <button onClick={reset} className="mx-auto mt-3 block rounded-lg bg-stone-200 px-4 py-1.5 text-xs font-bold hover:bg-stone-300">Mezclar de nuevo</button>}
    </div>
  );
}

/* 4 - DIANA VELOZ */
export function GameTargets({ onComplete }: GameProps) {
  const [phase, setPhase] = useState<"idle" | "play" | "done">("idle");
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [round, setRound] = useState(0);
  const [hits, setHits] = useState(0);
  const [size, setSize] = useState(56);
  const timer = useRef<any>(null);

  const nextTarget = (r: number) => {
    if (r >= 10) { setPhase("done"); onComplete(hits * 100, `${hits}/10`); return; }
    setRound(r);
    setPos({ x: 8 + Math.random() * 78, y: 12 + Math.random() * 70 });
    setSize(62 - r * 2.5);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => nextTarget(r + 1), 1300 - r * 50);
  };
  const start = () => { setHits(0); setPhase("play"); nextTarget(0); };
  const hit = () => { setHits((h) => h + 1); clearTimeout(timer.current); nextTarget(round + 1); };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div>
      <GameHeader instruction="Toca la diana 10 veces antes de que desaparezca. ¡Cada vez más pequeña y rápida!" extra={<span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-800">{hits}/10 · Ronda {Math.min(round + 1, 10)}/10</span>} />
      {phase === "idle" && (
        <div className="rounded-2xl bg-red-50 p-8 text-center ring-1 ring-red-200">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-4xl text-white">◎</div>
          <p className="text-sm font-bold text-red-900">¿Puntería lista? Tienes ~1 segundo por diana.</p>
          <button onClick={start} className="mt-4 rounded-xl bg-red-600 px-6 py-2.5 font-black text-white hover:bg-red-700">¡Empezar!</button>
        </div>
      )}
      {phase === "play" && (
        <div className="dot-bg relative h-[320px] overflow-hidden rounded-2xl bg-stone-50 ring-1 ring-stone-200">
          <div className="absolute left-2 top-2 h-2 rounded-full bg-stone-200" style={{ width: "calc(100% - 16px)" }}>
            <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${((round) / 10) * 100}%` }} />
          </div>
          <button onClick={hit} style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: size, height: size }} className="animate-pop-in absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 text-white shadow-lg ring-4 ring-red-200 active:scale-90">
            <span className="flex h-[70%] w-[70%] items-center justify-center rounded-full bg-white text-red-600"><span className="flex h-[55%] w-[55%] items-center justify-center rounded-full bg-red-500 text-white text-xs font-black">{round + 1}</span></span>
          </button>
        </div>
      )}
      {phase === "done" && (
        <WinBanner title={hits >= 7 ? "¡Francotirador! 🎯" : hits >= 4 ? "¡Bien apuntado!" : "¡Sigue practicando!"} subtitle={`Acertaste ${hits} de 10 dianas.`} score={`${hits}/10`} onRestart={start} />
      )}
    </div>
  );
}

/* 5 - PAREJAS MEMORIA */
const MEMO_EMOJI = ["🚀", "🎮", "🍕", "🐱", "⚽", "🎧"];
export function GameMemory({ onComplete, config }: GameProps) {
  const EMO = useMemo(() => {
    const list = String(config?.emojis || "").split(",").map((s) => s.trim()).filter(Boolean);
    return list.length >= 6 ? list.slice(0, 6) : MEMO_EMOJI;
  }, [config]);
  const [deck, setDeck] = useState<string[]>(() => shuffle([...EMO, ...EMO]));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);
  const lock = useRef(false);

  const flip = (i: number) => {
    if (won || lock.current || open.includes(i) || matched.has(`${i}`)) return;
    // check already matched value+? Better track matched indices
    if (open.length === 1 && open[0] === i) return;
    const no = [...open, i];
    setOpen(no);
    if (no.length === 2) {
      setMoves((m) => m + 1);
      lock.current = true;
      const [a, b] = no;
      if (deck[a] === deck[b]) {
        setTimeout(() => {
          setMatched((prev) => {
            const nm = new Set(prev);
            nm.add(`${a}`);
            nm.add(`${b}`);
            if (nm.size === 12) { setWon(true); onComplete(1000 - secs * 10 - moves * 5, `${moves + 1} intentos`); }
            return nm;
          });
          setOpen([]);
          lock.current = false;
        }, 550);
      } else {
        setTimeout(() => { setOpen([]); lock.current = false; }, 750);
      }
    }
  };
  const reset = () => { setDeck(shuffle([...EMO, ...EMO])); setOpen([]); setMatched(new Set()); setMoves(0); setWon(false); };
  const isUp = (i: number) => open.includes(i) || matched.has(`${i}`);

  return (
    <div>
      <GameHeader instruction="Encuentra las 6 parejas. Memoriza y combina." secs={secs} extra={<span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-800">{moves} intentos</span>} />
      {!won ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {deck.map((e, i) => (
            <button key={i} onClick={() => flip(i)} className={`flex aspect-square items-center justify-center rounded-xl text-3xl transition-all active:scale-95 ${isUp(i) ? "bg-white ring-2 ring-emerald-300" : "bg-stone-900 text-transparent hover:bg-stone-800"}`}>
              <span className={isUp(i) ? "" : "select-none"}>{isUp(i) ? e : "?"}</span>
            </button>
          ))}
        </div>
      ) : (
        <WinBanner title="¡Memoria de elefante! 🐘" subtitle={`6 parejas en ${moves} intentos y ${formatTime(secs)}.`} score={`${moves} intentos`} onRestart={reset} />
      )}
    </div>
  );
}

/* 6 - SIMON */
const SIMON_COLORS = [
  { name: "Verde", bg: "bg-emerald-500", ring: "ring-emerald-300", hex: "#10b981" },
  { name: "Rojo", bg: "bg-red-500", ring: "ring-red-300", hex: "#ef4444" },
  { name: "Amarillo", bg: "bg-amber-400", ring: "ring-amber-200", hex: "#fbbf24" },
  { name: "Azul", bg: "bg-sky-500", ring: "ring-sky-300", hex: "#0ea5e9" },
];
export function GameSimon({ onComplete }: GameProps) {
  const [seq, setSeq] = useState<number[]>(() => Array.from({ length: 5 }, () => Math.floor(Math.random() * 4)));
  const [level, setLevel] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [input, setInput] = useState<number[]>([]);
  const [msg, setMsg] = useState("Pulsa INICIAR para escuchar la secuencia.");
  const [won, setWon] = useState(false);

  const playSeq = async (len: number) => {
    setPlaying(true);
    setInput([]);
    setMsg(`Nivel ${len}: observa... 👀`);
    await new Promise((r) => setTimeout(r, 600));
    for (let i = 0; i < len; i++) {
      setActive(seq[i]);
      await new Promise((r) => setTimeout(r, 550));
      setActive(null);
      await new Promise((r) => setTimeout(r, 250));
    }
    setMsg(`Tu turno: repite ${len} colores.`);
    setPlaying(false);
  };
  const start = () => { setWon(false); setLevel(1); playSeq(1); };
  const press = (c: number) => {
    if (playing || won) return;
    const ni = [...input, c];
    setInput(ni);
    setActive(c);
    setTimeout(() => setActive(null), 200);
    const idx = ni.length - 1;
    if (ni[idx] !== seq[idx]) {
      setMsg("❌ ¡Fallaste! Escucha de nuevo...");
      setTimeout(() => playSeq(level), 1000);
      return;
    }
    if (ni.length === level) {
      if (level === 5) { setWon(true); setMsg("¡Campeón!"); onComplete(500, "5 niveles"); }
      else { setMsg("✅ ¡Bien! Siguiente nivel..."); setTimeout(() => { setLevel(level + 1); playSeq(level + 1); }, 1000); }
    }
  };

  return (
    <div>
      <GameHeader instruction="Simon dice: memoriza la secuencia de colores y repítela. Llega al nivel 5." extra={<span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-black text-white">Nivel {level}/5</span>} />
      <p className="mb-3 rounded-xl bg-stone-100 px-3 py-2 text-center text-sm font-bold text-stone-700">{msg}</p>
      {!won ? (
        <>
          <div className="mx-auto grid max-w-[300px] grid-cols-2 gap-3">
            {SIMON_COLORS.map((c, i) => (
              <button key={i} onClick={() => press(i)} disabled={playing} className={`aspect-square rounded-2xl ${c.bg} shadow-md transition-all ${active === i ? `scale-105 brightness-125 ring-8 ${c.ring}` : "opacity-90"} ${playing ? "cursor-not-allowed" : "hover:brightness-110 active:scale-95"}`}>
                <span className="text-xs font-black uppercase tracking-widest text-white/90">{c.name}</span>
              </button>
            ))}
          </div>
          <button onClick={start} className="mx-auto mt-4 block rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-black text-white hover:bg-stone-700">▶ INICIAR / REINICIAR</button>
          <div className="mt-2 flex justify-center gap-1.5">{Array.from({ length: 5 }).map((_, i) => (<span key={i} className={`h-2.5 w-2.5 rounded-full ${i < level ? "bg-emerald-500" : "bg-stone-200"}`} />))}</div>
        </>
      ) : (
        <div className="mt-3"><WinBanner title="¡Mente prodigiosa! 🧠" subtitle="Superaste los 5 niveles de Simon." score="5/5 niveles" onRestart={() => { setSeq(Array.from({ length: 5 }, () => Math.floor(Math.random() * 4))); setLevel(1); setWon(false); setMsg("Pulsa INICIAR."); }} /></div>
      )}
    </div>
  );
}

/* 7 - LABERINTO */
const MAZE = [
  [0, 0, 1, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [1, 1, 0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0],
];
export function GameMaze({ onComplete }: GameProps) {
  const [p, setP] = useState({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);

  const tryMove = (dr: number, dc: number) => {
    if (won) return;
    const nr = p.r + dr, nc = p.c + dc;
    if (nr < 0 || nr > 6 || nc < 0 || nc > 6 || MAZE[nr][nc] === 1) return;
    setP({ r: nr, c: nc });
    setMoves((m) => m + 1);
    if (nr === 6 && nc === 6) { setWon(true); onComplete(600 - secs * 5 - moves, `${moves + 1} pasos`); }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") tryMove(-1, 0);
      if (e.key === "ArrowDown") tryMove(1, 0);
      if (e.key === "ArrowLeft") tryMove(0, -1);
      if (e.key === "ArrowRight") tryMove(0, 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  const reset = () => { setP({ r: 0, c: 0 }); setMoves(0); setWon(false); };

  return (
    <div>
      <GameHeader instruction="Lleva el punto 🟢 hasta la meta 🏁. Usa flechas o botones." secs={secs} extra={<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">{moves} pasos</span>} />
      {!won ? (
        <>
          <div className="mx-auto grid max-w-[320px] grid-cols-7 gap-0.5 rounded-2xl bg-stone-900 p-2">
            {MAZE.map((row, r) => row.map((cell, c) => {
              const isP = p.r === r && p.c === c;
              const isG = r === 6 && c === 6;
              const isS = r === 0 && c === 0;
              return <div key={`${r}-${c}`} className={`flex aspect-square items-center justify-center rounded-[4px] text-sm ${cell === 1 ? "bg-stone-800" : isP ? "bg-emerald-400" : isG ? "bg-amber-300" : isS ? "bg-white/20" : "bg-white"}`}>{isP ? "●" : isG ? "🏁" : ""}</div>;
            }))}
          </div>
          <div className="mx-auto mt-3 grid max-w-[200px] grid-cols-3 gap-1.5">
            <div />
            <button onClick={() => tryMove(-1, 0)} className="rounded-xl bg-stone-900 py-2 text-lg font-black text-white active:scale-95">↑</button>
            <div />
            <button onClick={() => tryMove(0, -1)} className="rounded-xl bg-stone-900 py-2 text-lg font-black text-white active:scale-95">←</button>
            <button onClick={() => tryMove(1, 0)} className="rounded-xl bg-stone-900 py-2 text-lg font-black text-white active:scale-95">↓</button>
            <button onClick={() => tryMove(0, 1)} className="rounded-xl bg-stone-900 py-2 text-lg font-black text-white active:scale-95">→</button>
          </div>
        </>
      ) : (
        <WinBanner title="¡Escapaste del laberinto! 🏁" subtitle={`En ${moves} pasos y ${formatTime(secs)}.`} score={`${moves} pasos`} onRestart={reset} />
      )}
    </div>
  );
}

/* 8 - TOPO VELOZ */
export function GameWhack({ onComplete, config }: GameProps) {
  const MOLE = config?.emoji || "🐹";
  const HOLE = config?.hole || "🕳️";
  const [active, setActive] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [phase, setPhase] = useState<"idle" | "play" | "done">("idle");

  useEffect(() => {
    if (phase !== "play") return;
    if (time <= 0) { setPhase("done"); setActive(null); onComplete(score * 50, `${score} topos`); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, phase]);

  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => setActive(Math.floor(Math.random() * 9)), 700);
    return () => clearInterval(t);
  }, [phase]);

  const start = () => { setScore(0); setTime(30); setPhase("play"); };
  const whack = (i: number) => { if (phase === "play" && i === active) { setScore((s) => s + 1); setActive(null); } };

  return (
    <div>
      <GameHeader instruction={`¡Atrapa a ${MOLE} cuando asome! Tienes 30 segundos. Meta: 12 capturas.`} extra={<span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-stone-900">⏱ {time}s · ⭐ {score}</span>} />
      {phase === "idle" && (
        <div className="rounded-2xl bg-amber-50 p-8 text-center ring-1 ring-amber-200">
          <div className="text-6xl">{MOLE}</div>
          <button onClick={start} className="mt-4 rounded-xl bg-amber-500 px-6 py-2.5 font-black text-white hover:bg-amber-600">¡A por ellos!</button>
        </div>
      )}
      {phase === "play" && (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <button key={i} onClick={() => whack(i)} className={`flex aspect-square items-center justify-center rounded-2xl text-4xl transition-all active:scale-95 ${active === i ? "bg-emerald-200 ring-2 ring-emerald-500" : "bg-stone-200/70"}`}>
              {active === i ? MOLE : HOLE}
            </button>
          ))}
        </div>
      )}
      {phase === "done" && (
        <WinBanner title={score >= 12 ? "¡Capturas maestras! 🏆" : "¡Buen intento!"} subtitle={`Atrapaste ${score} veces a ${MOLE} en 30s.`} score={`${score} capturas`} onRestart={start} />
      )}
    </div>
  );
}

/* 9 - ADIVINA NUMERO */
export function GameGuess({ onComplete, config }: GameProps) {
  const min = Number(config?.min ?? 1);
  const max = Number(config?.max ?? 100);
  const label = config?.label || `Adivina el número secreto del ${min} al ${max}.`;
  const [secret] = useState(() => (config?.secret ? Number(config.secret) : Math.floor(Math.random() * (max - min + 1)) + min));
  const [guess, setGuess] = useState("");
  const [log, setLog] = useState<{ n: number; r: string }[]>([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const left = 7 - log.length;

  const send = () => {
    const n = parseInt(guess);
    if (isNaN(n) || n < min || n > max || won || lost) return;
    const r = n === secret ? "¡Correcto! 🎉" : n < secret ? "📈 Muy bajo, sube" : "📉 Muy alto, baja";
    const nl = [...log, { n, r }];
    setLog(nl);
    setGuess("");
    if (n === secret) { setWon(true); onComplete(700 - nl.length * 50, `${nl.length} intentos`); }
    else if (nl.length >= 7) setLost(true);
  };
  const reset = () => window.location.reload();

  return (
    <div>
      <GameHeader instruction={`${label} Rango ${min}–${max}. Tienes 7 intentos con pistas.`} extra={<span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-800">{left} intentos</span>} />
      {!won && !lost ? (
        <>
          <div className="flex gap-2">
            <input value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} type="number" min={min} max={max} placeholder={`Entre ${min} y ${max}`} className="w-full rounded-xl border-2 border-stone-200 px-4 py-2.5 text-lg font-black outline-none focus:border-indigo-400" />
            <button onClick={send} className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 font-black text-white hover:bg-indigo-700">Probar</button>
          </div>
          <div className="mt-3 space-y-1.5">
            {[...log].reverse().map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-white px-4 py-2 text-sm font-bold ring-1 ring-stone-200"><span className="text-lg font-black">{l.n}</span><span className={l.n === secret ? "text-emerald-600" : "text-stone-600"}>{l.r}</span></div>
            ))}
            {log.length === 0 && <p className="rounded-xl bg-stone-100 p-4 text-center text-sm font-semibold text-stone-500">💡 Empieza por el medio ({Math.round((min + max) / 2)}) para descartar la mitad.</p>}
          </div>
          <div className="mt-2 flex gap-1.5">{Array.from({ length: 7 }).map((_, i) => (<span key={i} className={`h-2 flex-1 rounded-full ${i < log.length ? "bg-indigo-300" : "bg-stone-200"}`} />))}</div>
        </>
      ) : won ? (
        <WinBanner title={`¡Era el ${secret}! 🎯`} subtitle={`Lo adivinaste en ${log.length} intentos.`} score={`${log.length}/7`} onRestart={reset} />
      ) : (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-center">
          <h3 className="text-xl font-black text-red-800">¡Se acabaron los intentos!</h3>
          <p className="mt-1 font-bold text-red-700">Era el {secret}. ¡Casi!</p>
          <button onClick={reset} className="mt-4 rounded-xl bg-red-600 px-5 py-2 font-bold text-white">Reintentar</button>
        </div>
      )}
    </div>
  );
}

/* 10 - MINI WORDLE */
const WORDS4 = ["GATO", "LUNA", "MESA", "NUBE", "FLOR", "TREN", "LAGO", "PATO"];
export function GameWordle({ onComplete, config }: GameProps) {
  const [secret] = useState(() => {
    const w = String(config?.word || "").toUpperCase().replace(/[^A-ZÑ]/g, "");
    return w.length >= 3 && w.length <= 8 ? w : WORDS4[Math.floor(Math.random() * WORDS4.length)];
  });
  const L = secret.length;
  const [tries, setTries] = useState<string[]>([]);
  const [cur, setCur] = useState("");
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);

  const color = (letter: string, idx: number) => {
    if (secret[idx] === letter) return "bg-emerald-500 text-white border-emerald-500";
    if (secret.includes(letter)) return "bg-amber-400 text-white border-amber-400";
    return "bg-stone-200 text-stone-500 border-stone-200";
  };
  const send = () => {
    if (cur.length !== L || won || lost) return;
    const nt = [...tries, cur.toUpperCase()];
    setTries(nt);
    setCur("");
    if (cur.toUpperCase() === secret) { setWon(true); onComplete(600 - nt.length * 50, `${nt.length}/6`); }
    else if (nt.length >= 6) setLost(true);
  };

  return (
    <div>
      <GameHeader instruction={`Adivina la palabra de ${L} letras en 6 intentos. 🟩 letra perfecta, 🟨 está pero en otro sitio.`} extra={<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">{tries.length}/6</span>} />
      <div className="mx-auto space-y-1.5" style={{ maxWidth: L * 52 }}>
        {Array.from({ length: 6 }).map((_, r) => {
          const word = tries[r] || (r === tries.length ? cur.toUpperCase().padEnd(L, " ") : " ".repeat(L));
          const done = r < tries.length;
          return (
            <div key={r} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${L}, minmax(0,1fr))` }}>
              {Array.from({ length: L }).map((_, c) => (
                <div key={c} className={`flex aspect-square items-center justify-center rounded-lg border-2 text-lg font-black ${done ? color(word[c], c) : "border-stone-200 bg-white"}`}>{word[c]?.trim() || ""}</div>
              ))}
            </div>
          );
        })}
      </div>
      {!won && !lost && (
        <div className="mt-3 flex gap-2">
          <input value={cur} onChange={(e) => setCur(e.target.value.replace(/[^a-zA-ZñÑ]/g, "").slice(0, L))} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={`${L} letras`} className="w-full rounded-xl border-2 border-stone-200 px-4 py-2 text-center text-lg font-black uppercase tracking-widest outline-none focus:border-emerald-400" maxLength={L} />
          <button onClick={send} disabled={cur.length !== L} className="shrink-0 rounded-xl bg-emerald-600 px-5 font-black text-white disabled:opacity-40">OK</button>
        </div>
      )}
      {won && <div className="mt-3"><WinBanner title={`¡Era ${secret}! 🎉`} subtitle={`En ${tries.length} intentos.`} score={`${tries.length}/6`} onRestart={() => window.location.reload()} /></div>}
      {lost && <div className="mt-3 rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-center"><p className="font-black text-red-800">Era {secret}. ¡A la próxima!</p><button onClick={() => window.location.reload()} className="mt-2 rounded-lg bg-red-600 px-4 py-1.5 text-sm font-bold text-white">Reintentar</button></div>}
    </div>
  );
}
