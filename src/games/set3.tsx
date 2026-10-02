import { useEffect, useState } from "react";
import { GameProps, GameHeader, WinBanner, useElapsed, shuffle, formatTime } from "./common";

/* 21 - CAZA PARES (solo pares) */
export function GameEvens({ onComplete }: GameProps) {
  const [nums] = useState(() => {
    const evens = Array.from({ length: 18 }, () => 10 + Math.floor(Math.random() * 45) * 2);
    const odds = Array.from({ length: 18 }, () => 11 + Math.floor(Math.random() * 44) * 2 + 1);
    return shuffle([...evens, ...odds].slice(0, 36));
  });
  const [found, setFound] = useState<number[]>([]);
  const [fails, setFails] = useState(0);
  const [time, setTime] = useState(30);
  const [done, setDone] = useState(false);
  const [won, setWon] = useState(false);
  const totalEvens = nums.filter((n) => n % 2 === 0).length;

  useEffect(() => {
    if (done) return;
    if (time <= 0) { setDone(true); setWon(found.length >= totalEvens * 0.8); onComplete(found.length * 30 - fails * 10, `${found.length}/${totalEvens}`); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, done]);

  const click = (n: number, i: number) => {
    if (done || found.includes(i)) return;
    if (n % 2 === 0) {
      const nf = [...found, i];
      setFound(nf);
      if (nf.length === totalEvens) { setDone(true); setWon(true); onComplete(800 - (30 - time) * 10 - fails * 15, `${nf.length}/${totalEvens}`); }
    } else setFails((f) => f + 1);
  };

  return (
    <div>
      <GameHeader instruction="Toca SOLO los números PARES antes de que acabe el tiempo. ¡Los impares restan!" extra={<span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-800">⏱ {time}s · ✅{found.length}/{totalEvens}</span>} />
      {!done ? (
        <div className="grid grid-cols-6 gap-1.5">
          {nums.map((n, i) => (
            <button key={i} onClick={() => click(n, i)} className={`aspect-square rounded-lg text-sm font-black tabular-nums transition-all active:scale-95 ${found.includes(i) ? "bg-emerald-500 text-white" : "bg-white ring-1 ring-stone-200 hover:bg-cyan-50"}`}>{found.includes(i) ? "✓" : n}</button>
          ))}
        </div>
      ) : (
        <WinBanner title={won ? "¡Cazador de pares! 🔢" : "¡Tiempo agotado!"} subtitle={`${found.length} de ${totalEvens} pares · ${fails} fallos.`} score={`${found.length}/${totalEvens}`} onRestart={() => window.location.reload()} />
      )}
    </div>
  );
}

/* 22 - TORRES DE HANOI */
export function GameHanoi({ onComplete }: GameProps) {
  const [pegs, setPegs] = useState<number[][]>([[3, 2, 1], [], []]);
  const [sel, setSel] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);

  const clickPeg = (p: number) => {
    if (won) return;
    if (sel === null) {
      if (pegs[p].length) setSel(p);
    } else {
      if (sel === p) { setSel(null); return; }
      const disk = pegs[sel][pegs[sel].length - 1];
      const top = pegs[p][pegs[p].length - 1];
      if (top === undefined || disk < top) {
        const np = pegs.map((peg) => [...peg]);
        np[sel].pop();
        np[p].push(disk);
        setPegs(np);
        setMoves((m) => m + 1);
        setSel(null);
        if (np[2].length === 3) { setWon(true); onComplete(Math.max(100, 800 - moves * 20 - secs * 5), `${moves + 1} movs`); }
      } else setSel(p && pegs[p].length ? p : null);
    }
  };

  return (
    <div>
      <GameHeader instruction="Mueve toda la torre al palo derecho. Nunca pongas un disco grande sobre uno pequeño. Mínimo 7 movs." secs={secs} extra={<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black">{moves} movs</span>} />
      {!won ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            {pegs.map((peg, pi) => (
              <button key={pi} onClick={() => clickPeg(pi)} className={`flex h-44 flex-col-reverse items-center justify-end gap-1 rounded-2xl p-2 pb-3 transition-all ${sel === pi ? "bg-amber-200 ring-2 ring-amber-500" : "bg-stone-100 ring-1 ring-stone-200 hover:bg-stone-200/70"}`}>
                <span className="mt-1 h-1.5 w-4/5 rounded bg-stone-400" />
                {peg.map((d, di) => (
                  <span key={di} className={`h-7 rounded-lg font-black text-white ${d === 3 ? "w-full bg-red-500" : d === 2 ? "w-3/4 bg-orange-400" : "w-1/2 bg-emerald-500"}`} style={{ order: -di }}>{d}</span>
                ))}
                <span className="text-[10px] font-black uppercase text-stone-400">{pi === 0 ? "Inicio" : pi === 1 ? "Medio" : "Meta 🎯"}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-bold text-stone-500">{sel === null ? "Toca un palo para coger el disco de arriba" : `Disco en mano del palo ${sel + 1} → toca destino`}</p>
        </>
      ) : (
        <WinBanner title="¡Torre conquistada! 🗼" subtitle={`En ${moves} movimientos y ${formatTime(secs)}.`} score={`${moves} movs`} onRestart={() => { setPegs([[3, 2, 1], [], []]); setMoves(0); setWon(false); setSel(null); }} />
      )}
    </div>
  );
}

/* 23 - EL INTRUSO */
const INTRUDER_ROUNDS = [
  { base: "🍎", intr: "🍏" },
  { base: "🐶", intr: "🐱" },
  { base: "⭐", intr: "🌟" },
  { base: "🟦", intr: "🟩" },
  { base: "😀", intr: "😃" },
];
export function GameIntruder({ onComplete }: GameProps) {
  const [round, setRound] = useState(0);
  const [pos] = useState<number[]>(() => Array.from({ length: 5 }, () => Math.floor(Math.random() * 25)));
  const [fails, setFails] = useState(0);
  const [done, setDone] = useState(false);
  const { secs } = useElapsed(!done);
  const cur = INTRUDER_ROUNDS[round];

  const click = (i: number) => {
    if (done) return;
    if (i === pos[round]) {
      if (round + 1 >= 5) { setDone(true); onComplete(600 - secs * 5 - fails * 20, "5/5"); }
      else setRound(round + 1);
    } else setFails((f) => f + 1);
  };

  return (
    <div>
      <GameHeader instruction="Hay UN intruso diferente en cada cuadrícula. ¡Encuéntralo rápido! 5 rondas." secs={secs} extra={<span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800">{round + 1}/5 · ❌{fails}</span>} />
      {!done ? (
        <>
          <p className="mb-2 text-center text-sm font-bold text-stone-600">Busca el {cur.intr} entre {cur.base}</p>
          <div className="mx-auto grid max-w-[300px] grid-cols-5 gap-1.5">
            {Array.from({ length: 25 }).map((_, i) => (
              <button key={`${round}-${i}`} onClick={() => click(i)} className="flex aspect-square items-center justify-center rounded-lg bg-white text-2xl ring-1 ring-stone-200 transition-all hover:bg-rose-50 active:scale-95">{i === pos[round] ? cur.intr : cur.base}</button>
            ))}
          </div>
        </>
      ) : (
        <WinBanner title="¡Ojo de halcón! 🦅" subtitle={`5 intrusos en ${formatTime(secs)} con ${fails} fallos.`} score={formatTime(secs)} onRestart={() => window.location.reload()} />
      )}
    </div>
  );
}

/* 24 - CANDADO SECRETO */
export function GameLock({ onComplete, config }: GameProps) {
  const [SECRET] = useState<number[]>(() => {
    const parts = String(config?.code || "").split(/[,\s]+/).map((p) => parseInt(p)).filter((n) => !isNaN(n) && n >= 0 && n <= 9);
    return parts.length >= 2 && parts.length <= 5 ? parts : [7, 4, 6];
  });
  const [HINTS] = useState<string[]>(() => {
    const h = String(config?.hints || "").split("|").map((s) => s.trim()).filter(Boolean);
    return h.length === SECRET.length ? h : SECRET.length === 3 ? ["3 + 4 = ?", "10 − 6 = ?", "2 × 3 = ?"] : SECRET.map((_, i) => `Cifra ${i + 1}`);
  });
  const [digits, setDigits] = useState<number[]>(() => SECRET.map(() => 0));
  const [tries, setTries] = useState(0);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);

  const ch = (i: number, d: number) => {
    if (won) return;
    const nd = [...digits];
    nd[i] = (nd[i] + d + 10) % 10;
    setDigits(nd);
  };
  const check = () => {
    setTries((t) => t + 1);
    if (digits.every((v, i) => v === SECRET[i])) { setWon(true); onComplete(500 - tries * 20 - secs * 2, `${tries + 1} intentos`); }
  };
  const hints = (i: number) => {
    const ok = digits[i] === SECRET[i];
    return ok ? "bg-emerald-500 text-white border-emerald-500" : "bg-white";
  };

  return (
    <div>
      <GameHeader instruction={`Descifra el candado de ${SECRET.length} cifras con las pistas.`} secs={secs} />
      {!won ? (
        <div className="text-center">
          <div className="grid gap-2 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200" style={{ gridTemplateColumns: `repeat(${SECRET.length}, minmax(0,1fr))` }}>
            {HINTS.map((h, i) => (
              <div key={i} className="rounded-xl bg-white p-2 ring-1 ring-stone-200">
                <p className="text-[10px] font-black uppercase text-stone-400">Cifra {i + 1}</p>
                <p className="text-sm font-black">{h}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-4 flex max-w-[300px] justify-center gap-3">
            {digits.map((d, i) => (
              <div key={i} className={`flex flex-col items-center rounded-2xl border-2 p-2 ${hints(i)}`}>
                <button onClick={() => ch(i, 1)} className="rounded-lg bg-stone-100 px-4 py-1 text-lg font-black hover:bg-stone-200">▲</button>
                <span className="py-1 text-4xl font-black tabular-nums">{d}</span>
                <button onClick={() => ch(i, -1)} className="rounded-lg bg-stone-100 px-4 py-1 text-lg font-black hover:bg-stone-200">▼</button>
              </div>
            ))}
          </div>
          <button onClick={check} className="mt-4 rounded-xl bg-stone-900 px-8 py-2.5 font-black text-white hover:bg-stone-700">🔓 Probar combinación</button>
          <p className="mt-2 text-xs font-bold text-stone-500">{tries} intentos</p>
        </div>
      ) : (
        <WinBanner title="¡Candado abierto! 🔓" subtitle={`Código ${SECRET.join("-")} en ${tries} intentos.`} score={formatTime(secs)} onRestart={() => { setDigits(SECRET.map(() => 0)); setTries(0); setWon(false); }} />
      )}
    </div>
  );
}

/* 25 - STROOP COLORES */
const STROOP = [
  { w: "ROJO", c: "Azul", col: "#0ea5e9" },
  { w: "VERDE", c: "Rojo", col: "#ef4444" },
  { w: "AZUL", c: "Verde", col: "#22c55e" },
  { w: "AMARILLO", c: "Rojo", col: "#ef4444" },
];
const STROOP_OPTS = ["Rojo", "Azul", "Verde", "Amarillo"];
const STROOP_HEX: Record<string, string> = { Rojo: "#ef4444", Azul: "#0ea5e9", Verde: "#22c55e", Amarillo: "#eab308" };
export function GameStroop({ onComplete }: GameProps) {
  const [rounds] = useState(() => shuffle(Array.from({ length: 10 }, () => STROOP[Math.floor(Math.random() * STROOP.length)])));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feed, setFeed] = useState<null | string>(null);
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(25);

  useEffect(() => {
    if (done) return;
    if (time <= 0) { setDone(true); onComplete(score * 80, `${score}/10`); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, done]);

  const pick = (o: string) => {
    if (feed || done) return;
    const ok = o === rounds[idx].c;
    setFeed(o);
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      setFeed(null);
      if (idx + 1 >= 10) { setDone(true); onComplete((score + (ok ? 1 : 0)) * 80, `${score + (ok ? 1 : 0)}/10`); }
      else setIdx(idx + 1);
    }, 450);
  };

  return (
    <div>
      <GameHeader instruction="¡No leas la palabra! Pulsa el COLOR de la tinta. Ej: ROJO en azul → pulsa AZUL." extra={<span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">⏱ {time}s · {idx + 1}/10</span>} />
      {!done ? (
        <div className="text-center">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200">
            <p className="text-5xl font-black tracking-wide" style={{ color: rounds[idx].col }}>{rounds[idx].w}</p>
            <p className="mt-1 text-xs font-bold text-stone-400">¿De qué color está pintada?</p>
          </div>
          <div className="mx-auto mt-3 grid max-w-[320px] grid-cols-2 gap-2">
            {STROOP_OPTS.map((o) => (
              <button key={o} onClick={() => pick(o)} className={`flex items-center gap-2 rounded-xl px-4 py-3 font-black ring-1 transition-all active:scale-95 ${feed === o ? (o === rounds[idx].c ? "bg-emerald-500 text-white" : "animate-shake bg-red-500 text-white") : "bg-white ring-stone-200 hover:bg-stone-50"}`}>
                <span className="h-4 w-4 rounded-full" style={{ background: STROOP_HEX[o] }} /> {o}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs font-black text-stone-500">Aciertos: {score}</p>
        </div>
      ) : (
        <WinBanner title={score >= 8 ? "¡Cerebro flexible! 🌀" : "¡Buen esfuerzo!"} subtitle={`${score} de 10 aciertos.`} score={`${score}/10`} onRestart={() => window.location.reload()} />
      )}
    </div>
  );
}

/* 26 - LIGHTS OUT */
function genLights(): boolean[][] {
  let g = Array.from({ length: 4 }, () => Array(4).fill(false));
  const flip = (gg: boolean[][], r: number, c: number) => {
    const d = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
    d.forEach(([dr, dc]) => { const nr = r + dr, nc = c + dc; if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) gg[nr][nc] = !gg[nr][nc]; });
  };
  for (let i = 0; i < 10; i++) flip(g, Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
  if (g.every((row) => row.every((v) => !v))) g[1][1] = g[1][2] = g[2][1] = true;
  return g;
}
export function GameLights({ onComplete }: GameProps) {
  const [g, setG] = useState<boolean[][]>(() => genLights());
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);

  const click = (r: number, c: number) => {
    if (won) return;
    const ng = g.map((row) => [...row]);
    [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) ng[nr][nc] = !ng[nr][nc];
    });
    setG(ng);
    setMoves((m) => m + 1);
    if (ng.every((row) => row.every((v) => !v))) { setWon(true); onComplete(Math.max(100, 700 - moves * 15 - secs * 5), `${moves + 1} movs`); }
  };

  return (
    <div>
      <GameHeader instruction="Apaga todas las luces 💡. Cada toque cambia la casilla y sus vecinas." secs={secs} extra={<span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black">{moves} movs</span>} />
      {!won ? (
        <div className="mx-auto grid max-w-[280px] grid-cols-4 gap-2 rounded-2xl bg-stone-900 p-3">
          {g.map((row, r) => row.map((on, c) => (
            <button key={`${r}-${c}`} onClick={() => click(r, c)} className={`flex aspect-square items-center justify-center rounded-xl text-2xl transition-all active:scale-95 ${on ? "bg-yellow-300 shadow-[0_0_12px_#fde047]" : "bg-stone-700"}`}>{on ? "💡" : ""}</button>
          )))}
        </div>
      ) : (
        <WinBanner title="¡Todo a oscuras! 🌙" subtitle={`En ${moves} movimientos.`} score={`${moves} movs`} onRestart={() => { setG(genLights()); setMoves(0); setWon(false); }} />
      )}
    </div>
  );
}

/* 27 - ZONA VERDE (timing) */
export function GameTiming({ onComplete }: GameProps) {
  const [pos, setPos] = useState(0);
  const [dir, setDir] = useState(1);
  const [round, setRound] = useState(1);
  const [hits, setHits] = useState(0);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  const speed = 2 + round * 0.9;

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setPos((p) => {
        let n = p + dir * speed;
        if (n >= 100) { n = 100; setDir(-1); }
        if (n <= 0) { n = 0; setDir(1); }
        return n;
      });
    }, 16);
    return () => clearInterval(t);
  }, [dir, done, round]);

  const stop = () => {
    if (done) return;
    const inZone = pos >= 42 && pos <= 58;
    if (inZone) {
      setHits((h) => h + 1);
      setMsg("✅ ¡Dentro!");
    } else setMsg("❌ ¡Fuera! Ajusta el ojo.");
    setTimeout(() => {
      setMsg("");
      if (round >= 5) { setDone(true); const h = hits + (inZone ? 1 : 0); onComplete(h * 150, `${h}/5`); }
      else setRound(round + 1);
    }, 700);
  };

  return (
    <div>
      <GameHeader instruction="Pulsa PARAR cuando el cursor esté en la zona verde central. 5 intentos." extra={<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">{round}/5 · ✅{hits}</span>} />
      {!done ? (
        <div className="text-center">
          <div className="relative h-12 overflow-hidden rounded-full bg-stone-200 ring-1 ring-stone-300">
            <div className="absolute left-[42%] top-0 h-full w-[16%] bg-emerald-400" />
            <div className="absolute top-0 h-full w-[3px] bg-stone-900" style={{ left: `${pos}%` }} />
          </div>
          <p className="mt-1 text-xs font-bold text-stone-500">Velocidad x{round} · cada ronda más rápido</p>
          <button onClick={stop} className="mt-4 w-full rounded-2xl bg-emerald-600 py-4 text-xl font-black text-white hover:bg-emerald-700 active:scale-[0.98]">⏹ PARAR</button>
          {msg && <p className="animate-pop-in mt-2 text-lg font-black">{msg}</p>}
        </div>
      ) : (
        <WinBanner title={hits >= 3 ? "¡Pulso de cirujano! 🎯" : "¡Buen pulso!"} subtitle={`${hits} de 5 en zona verde.`} score={`${hits}/5`} onRestart={() => window.location.reload()} />
      )}
    </div>
  );
}

/* 28 - RECICLA BIEN */
const RECYCLE_ITEMS = [
  { e: "🍾", n: "Botella vidrio", b: "Verde" },
  { e: "📰", n: "Periódico", b: "Azul" },
  { e: "🥫", n: "Lata", b: "Amarillo" },
  { e: "🍌", n: "Cáscara plátano", b: "Marrón" },
  { e: "📦", n: "Caja cartón", b: "Azul" },
  { e: "🥤", n: "Vaso plástico", b: "Amarillo" },
  { e: "🍷", n: "Copa rota", b: "Verde" },
  { e: "🍎", n: "Restos manzana", b: "Marrón" },
  { e: "🧴", n: "Bote champú", b: "Amarillo" },
  { e: "📝", n: "Folio usado", b: "Azul" },
];
const BINS = [
  { n: "Amarillo", e: "♻️", d: "Plástico", c: "bg-yellow-400" },
  { n: "Azul", e: "📄", d: "Papel", c: "bg-blue-500" },
  { n: "Verde", e: "🍾", d: "Vidrio", c: "bg-emerald-500" },
  { n: "Marrón", e: "🌱", d: "Orgánico", c: "bg-amber-700" },
];
export function GameRecycle({ onComplete }: GameProps) {
  const [order] = useState(() => shuffle(RECYCLE_ITEMS));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feed, setFeed] = useState<null | boolean>(null);
  const [done, setDone] = useState(false);

  const pick = (b: string) => {
    if (feed !== null || done) return;
    const ok = b === order[idx].b;
    setFeed(ok);
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      setFeed(null);
      if (idx + 1 >= order.length) { setDone(true); onComplete((score + (ok ? 1 : 0)) * 80, `${score + (ok ? 1 : 0)}/10`); }
      else setIdx(idx + 1);
    }, 650);
  };

  return (
    <div>
      <GameHeader instruction="Clasifica cada residuo en su contenedor. ¡Salva el planeta!" extra={<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">{idx + 1}/10 · ⭐{score}</span>} />
      {!done ? (
        <div className="text-center">
          <div className={`mx-auto max-w-[220px] rounded-2xl p-5 ring-1 ${feed === true ? "bg-emerald-100 ring-emerald-400" : feed === false ? "animate-shake bg-red-100 ring-red-300" : "bg-white ring-stone-200"}`}>
            <div className="text-6xl">{order[idx].e}</div>
            <p className="mt-2 font-black">{order[idx].n}</p>
            {feed !== null && <p className="mt-1 text-sm font-black">{feed ? "✅ ¡Bien!" : `❌ Era ${order[idx].b}`}</p>}
          </div>
          <div className="mx-auto mt-3 grid max-w-[340px] grid-cols-2 gap-2">
            {BINS.map((b) => (
              <button key={b.n} onClick={() => pick(b.n)} className={`flex items-center gap-2 rounded-xl p-2.5 text-left font-black text-white transition-all active:scale-95 ${b.c}`}><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/25 text-xl">{b.e}</span><span className="text-sm leading-tight">{b.n}<br /><span className="text-[11px] font-bold opacity-80">{b.d}</span></span></button>
            ))}
          </div>
        </div>
      ) : (
        <WinBanner title={score >= 8 ? "¡Eco-héroe! 🌍" : "¡Buen reciclaje!"} subtitle={`${score} de 10 bien clasificados.`} score={`${score}/10`} onRestart={() => window.location.reload()} />
      )}
    </div>
  );
}

/* 29 - MEMORIA FLASH */
const FLASH_EMOJIS = ["🐶", "🍕", "🚀", "🌈", "🎸", "🐱", "⚽", "🍩"];
export function GameFlash({ onComplete, config }: GameProps) {
  const [POOL] = useState<string[]>(() => {
    const list = String(config?.emojis || "").split(",").map((s) => s.trim()).filter(Boolean);
    return list.length >= 6 ? list.slice(0, 8) : FLASH_EMOJIS;
  });
  const [level, setLevel] = useState(1);
  const [seq, setSeq] = useState<string[]>(() => shuffle(POOL).slice(0, 3));
  const [show, setShow] = useState(true);
  const [input, setInput] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(3);
  const lengths = [3, 4, 5];

  useEffect(() => {
    setShow(true);
    setCount(3);
    const c = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) { clearInterval(c); setShow(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(c);
  }, [level, seq]);

  const press = (e: string) => {
    if (show || done) return;
    const ni = [...input, e];
    setInput(ni);
    const idx = ni.length - 1;
    if (ni[idx] !== seq[idx]) {
      // fail level, retry same
      setTimeout(() => setInput([]), 500);
      return;
    }
    if (ni.length === seq.length) {
      const ns = score + 1;
      setScore(ns);
      setTimeout(() => {
        setInput([]);
        if (level >= 3) { setDone(true); onComplete(600, `${ns}/3 niveles`); }
        else {
          setLevel(level + 1);
          setSeq(shuffle(POOL).slice(0, lengths[level]));
        }
      }, 700);
    }
  };

  return (
    <div>
      <GameHeader instruction="Memoriza la secuencia y repítela en orden. 3 niveles (3, 4 y 5 emojis)." extra={<span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-800">Nivel {level}/3</span>} />
      {!done ? (
        <div className="text-center">
          {show ? (
            <div className="rounded-2xl bg-indigo-600 p-6 text-white">
              <p className="text-xs font-black uppercase opacity-70">Memoriza… {count}s</p>
              <div className="mt-2 flex justify-center gap-2 text-5xl">{seq.map((e, i) => (<span key={i} className="animate-pop-in">{e}</span>))}</div>
            </div>
          ) : (
            <>
              <div className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-stone-100 p-3 ring-1 ring-stone-200">
                {input.length === 0 && <span className="text-sm font-bold text-stone-400">Tu turno: toca en orden…</span>}
                {input.map((e, i) => (<span key={i} className="text-3xl">{e}</span>))}
              </div>
              <div className="mx-auto mt-3 grid max-w-[280px] grid-cols-4 gap-2">
                {POOL.map((e) => (
                  <button key={e} onClick={() => press(e)} className="flex aspect-square items-center justify-center rounded-xl bg-white text-3xl ring-1 ring-stone-200 hover:bg-indigo-50 active:scale-95">{e}</button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <WinBanner title="¡Memoria fotográfica! 📸" subtitle="Superaste los 3 niveles." score="3/3" onRestart={() => window.location.reload()} />
      )}
    </div>
  );
}

/* 30 - DADO 21 */
export function GameDice21({ onComplete }: GameProps) {
  const [ps, setPs] = useState<number[]>([]);
  const [cs, setCs] = useState<number[]>([]);
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [msg, setMsg] = useState("Tira el dado. Acércate a 21 sin pasarte.");
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState("");
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  const roll = () => Math.ceil(Math.random() * 6);

  const playerRoll = () => {
    if (phase === "done" || rolling) return;
    setRolling(true);
    setTimeout(() => {
      const d = roll();
      const np = [...ps, d];
      setPs(np);
      setRolling(false);
      if (sum(np) > 21) {
        setPhase("done");
        setResult("💥 ¡Te pasaste! Gana la máquina.");
        setMsg(`Te pasaste con ${sum(np)}.`);
      } else if (sum(np) === 21) playerStand(np);
      else setMsg(`Llevas ${sum(np)}. ¿Otra o te plantas?`);
    }, 400);
  };
  const playerStand = (npArg?: number[]) => {
    const player = npArg || ps;
    if (!player.length) return;
    // CPU juega: tira hasta >=16
    let cpu: number[] = [];
    while (sum(cpu) < 16) cpu.push(roll());
    setCs(cpu);
    setPhase("done");
    const pSum = sum(player), cSum = sum(cpu);
    if (cSum > 21 || pSum > cSum) { setResult("🏆 ¡GANASTE!"); onComplete(500, `${pSum} vs ${cSum}`); }
    else if (pSum === cSum) { setResult("🤝 ¡Empate!"); onComplete(250, "empate"); }
    else setResult("🤖 Gana la máquina.");
    setMsg(`Tú ${pSum} · CPU ${cSum}`);
  };
  const reset = () => { setPs([]); setCs([]); setPhase("play"); setResult(""); setMsg("Tira el dado. Acércate a 21 sin pasarte."); };

  const Dice = ({ v }: { v: number }) => (
    <span className="animate-pop-in flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm ring-1 ring-stone-200">{"⚀⚁⚂⚃⚄⚅"[v - 1]}</span>
  );

  return (
    <div>
      <GameHeader instruction="Blackjack con dados 🎲: suma 21 o quédate cerca. La CPU se planta en 16." />
      <div className="rounded-2xl bg-emerald-900 p-4 text-white">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase opacity-70">Tú: {sum(ps)}</p>
          <p className="text-xs font-black uppercase opacity-70">CPU: {phase === "done" ? sum(cs) : "?"}</p>
        </div>
        <div className="mt-2 flex min-h-[52px] flex-wrap gap-1.5">{ps.map((d, i) => (<Dice key={i} v={d} />))}{ps.length === 0 && <span className="text-sm font-bold opacity-50">Sin tiradas aún</span>}</div>
        {phase === "done" && <div className="mt-2 flex flex-wrap gap-1.5 border-t border-white/20 pt-2">{cs.map((d, i) => (<Dice key={i} v={d} />))}</div>}
        <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-bold">{rolling ? "🎲 Girando…" : msg}</p>
        {result && <p className="animate-pop-in mt-2 text-center text-2xl font-black">{result}</p>}
      </div>
      {phase === "play" ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={playerRoll} disabled={rolling} className="rounded-xl bg-emerald-600 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-50">🎲 Tirar</button>
          <button onClick={() => playerStand()} disabled={!ps.length || rolling} className="rounded-xl bg-stone-900 py-3 font-black text-white hover:bg-stone-700 disabled:opacity-40">✋ Plantarse</button>
        </div>
      ) : (
        <div className="mt-3"><WinBanner title="Ronda terminada" subtitle={msg} score={result} onRestart={reset} /></div>
      )}
    </div>
  );
}

/* 31 - ORDENA NUESTRA HISTORIA */
const STORY_DEFAULT = ["Naciste tú", "Primer verano en la playa", "Tu primer día de cole", "El gran viaje juntas", "Hoy, con estas 30 esferas"];
export function GameStory({ onComplete, config }: GameProps) {
  const [EVENTS] = useState<string[]>(() => {
    const list = String(config?.events || "").split("\n").map((s) => s.trim()).filter(Boolean);
    return list.length >= 3 ? list.slice(0, 7) : STORY_DEFAULT;
  });
  const [pool, setPool] = useState<string[]>(() => {
    let s = shuffle(EVENTS);
    if (s.join() === EVENTS.join()) s = [...s.slice(1), s[0]];
    return s;
  });
  const [placed, setPlaced] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [err, setErr] = useState(false);
  const [fails, setFails] = useState(0);

  const pick = (ev: string) => {
    if (won) return;
    const expected = EVENTS[placed.length];
    if (ev === expected) {
      const np = [...placed, ev];
      setPlaced(np);
      setPool(pool.filter((p) => p !== ev));
      if (np.length === EVENTS.length) { setWon(true); onComplete(500 - fails * 30, `${fails} fallos`); }
    } else {
      setFails((f) => f + 1);
      setErr(true);
      setTimeout(() => setErr(false), 400);
    }
  };

  return (
    <div>
      <GameHeader instruction="Ordena los capítulos de nuestra historia del primero al último. Toca el que va a continuación." extra={<span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800">{placed.length}/{EVENTS.length}</span>} />
      <div className="relative ml-3 border-l-2 border-dashed border-rose-300 pl-5">
        {placed.map((p, i) => (
          <div key={i} className="animate-pop-in relative mb-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-900 ring-1 ring-rose-200">
            <span className="absolute -left-[31px] top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">{i + 1}</span>
            {p}
          </div>
        ))}
        {!won && (
          <div className={`relative mb-2 rounded-xl border-2 border-dashed px-3 py-2 text-sm font-bold ${err ? "animate-shake border-red-400 bg-red-50 text-red-700" : "border-rose-300 text-rose-400"}`}>
            <span className="absolute -left-[31px] top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-200 text-[10px] font-black text-rose-700">{placed.length + 1}</span>
            {err ? "Ese no va aquí…" : "¿Qué pasó después?"}
          </div>
        )}
      </div>
      {!won ? (
        <div className="mt-3 grid gap-2">
          {pool.map((ev) => (
            <button key={ev} onClick={() => pick(ev)} className="rounded-xl bg-white px-4 py-3 text-left text-sm font-bold ring-1 ring-stone-200 transition-all hover:bg-rose-50 active:scale-[0.98]">📖 {ev}</button>
          ))}
        </div>
      ) : (
        <div className="mt-3"><WinBanner title="Nuestra historia, en orden 💛" subtitle="Y lo mejor es que todavía no ha terminado." score={`${fails} fallos`} onRestart={() => window.location.reload()} /></div>
      )}
    </div>
  );
}
