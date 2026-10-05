import { useEffect, useRef, useState } from "react";
import { GameProps, GameHeader, WinBanner, useElapsed, shuffle, formatTime } from "./common";

/* CAÇA PARELLS */
export function GameEvens({ onComplete }: GameProps) {
  const [nums] = useState(() => shuffle([...Array.from({ length: 18 }, () => 10 + Math.floor(Math.random() * 45) * 2), ...Array.from({ length: 18 }, () => 11 + Math.floor(Math.random() * 44) * 2)]));
  const [found, setFound] = useState<number[]>([]);
  const [fails, setFails] = useState(0);
  const [time, setTime] = useState(30);
  const [done, setDone] = useState(false);
  const totalEvens = nums.filter((n) => n % 2 === 0).length;

  useEffect(() => {
    if (done) return;
    if (time <= 0) { setDone(true); onComplete(found.length * 30 - fails * 10, `${found.length}/${totalEvens}`); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000); return () => clearTimeout(t);
  }, [time, done]);

  const click = (n: number, i: number) => {
    if (done || found.includes(i)) return;
    if (n % 2 === 0) { const nf = [...found, i]; setFound(nf); if (nf.length === totalEvens) { setDone(true); onComplete(800 - (30 - time) * 10 - fails * 15, `${nf.length}/${totalEvens}`); } }
    else setFails((f) => f + 1);
  };

  return (
    <div>
      <GameHeader instruction="Toca NOMÉS els números PARELLS abans que s'acabi el temps. Els senars resten!" extra={<span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-800">⏱ {time}s · ✅{found.length}/{totalEvens}</span>} />
      {!done ? (
        <div className="grid grid-cols-6 gap-1.5">{nums.map((n, i) => (<button key={i} onClick={() => click(n, i)} className={`aspect-square rounded-lg text-sm font-black tabular-nums transition-all active:scale-95 ${found.includes(i) ? "bg-emerald-500 text-white" : "bg-white ring-1 ring-stone-200 hover:bg-cyan-50"}`}>{found.includes(i) ? "✓" : n}</button>))}</div>
      ) : (
        <WinBanner title={found.length >= totalEvens * 0.8 ? "Caçadora de parells! 🔢" : "Temps esgotat!"} subtitle={`${found.length} de ${totalEvens} parells · ${fails} errors.`} score={`${found.length}/${totalEvens}`} onRestart={() => { setFound([]); setFails(0); setTime(30); setDone(false); }} />
      )}
    </div>
  );
}

/* HANOI */
export function GameHanoi({ onComplete }: GameProps) {
  const [pegs, setPegs] = useState<number[][]>([[3, 2, 1], [], []]);
  const [sel, setSel] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);

  const clickPeg = (p: number) => {
    if (won) return;
    if (sel === null) { if (pegs[p].length) setSel(p); return; }
    if (sel === p) { setSel(null); return; }
    const disk = pegs[sel][pegs[sel].length - 1], top = pegs[p][pegs[p].length - 1];
    if (top === undefined || disk < top) {
      const np = pegs.map((peg) => [...peg]); np[sel].pop(); np[p].push(disk);
      setPegs(np); setMoves((m) => m + 1); setSel(null);
      if (np[2].length === 3) { setWon(true); onComplete(Math.max(100, 800 - moves * 20 - secs * 5), `${moves + 1} movs`); }
    } else setSel(pegs[p].length ? p : null);
  };

  return (
    <div>
      <GameHeader instruction="Mou tota la torre al pal dret. Mai posis un disc gran sobre un de petit. Mínim 7 movs." secs={secs} extra={<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black">{moves} movs</span>} />
      {!won ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            {pegs.map((peg, pi) => (
              <button key={pi} onClick={() => clickPeg(pi)} className={`flex h-44 flex-col-reverse items-center justify-end gap-1 rounded-2xl p-2 pb-3 transition-all ${sel === pi ? "bg-amber-200 ring-2 ring-amber-500" : "bg-stone-100 ring-1 ring-stone-200"}`}>
                <span className="mt-1 h-1.5 w-4/5 rounded bg-stone-400" />
                {peg.map((d, di) => (<span key={di} className={`h-7 rounded-lg font-black text-white ${d === 3 ? "w-full bg-red-500" : d === 2 ? "w-3/4 bg-orange-400" : "w-1/2 bg-emerald-500"}`} style={{ order: -di }}>{d}</span>))}
                <span className="text-[10px] font-black uppercase text-stone-400">{pi === 0 ? "Inici" : pi === 1 ? "Mig" : "Meta 🎯"}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-bold text-stone-500">{sel === null ? "Toca un pal per agafar el disc de dalt" : `Disc a la mà del pal ${sel + 1} → toca el destí`}</p>
        </>
      ) : (
        <WinBanner title="Torre conquerida! 🗼" subtitle={`En ${moves} moviments i ${formatTime(secs)}.`} score={`${moves} movs`} onRestart={() => { setPegs([[3, 2, 1], [], []]); setMoves(0); setWon(false); setSel(null); }} />
      )}
    </div>
  );
}

/* L'INTRÚS */
const INTRUDER_ROUNDS = [{ base: "🍎", intr: "🍏" }, { base: "🐶", intr: "🐱" }, { base: "⭐", intr: "🌟" }, { base: "🟦", intr: "🟩" }, { base: "😀", intr: "😃" }];
export function GameIntruder({ onComplete }: GameProps) {
  const [round, setRound] = useState(0);
  const [pos, setPos] = useState<number[]>(() => Array.from({ length: 5 }, () => Math.floor(Math.random() * 25)));
  const [fails, setFails] = useState(0);
  const [done, setDone] = useState(false);
  const { secs } = useElapsed(!done);
  const cur = INTRUDER_ROUNDS[round];

  const click = (i: number) => {
    if (done) return;
    if (i === pos[round]) { if (round + 1 >= 5) { setDone(true); onComplete(600 - secs * 5 - fails * 20, "5/5"); } else setRound(round + 1); }
    else setFails((f) => f + 1);
  };

  return (
    <div>
      <GameHeader instruction="Hi ha UN intrús diferent a cada graella. Troba'l ràpid! 5 rondes." secs={secs} extra={<span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800">{round + 1}/5 · ❌{fails}</span>} />
      {!done ? (
        <>
          <p className="mb-2 text-center text-sm font-bold text-stone-600">Busca el {cur.intr} entre {cur.base}</p>
          <div className="mx-auto grid max-w-[300px] grid-cols-5 gap-1.5">{Array.from({ length: 25 }).map((_, i) => (<button key={`${round}-${i}`} onClick={() => click(i)} className="flex aspect-square items-center justify-center rounded-lg bg-white text-2xl ring-1 ring-stone-200 transition-all hover:bg-rose-50 active:scale-95">{i === pos[round] ? cur.intr : cur.base}</button>))}</div>
        </>
      ) : (
        <WinBanner title="Ull de falcó! 🦅" subtitle={`5 intrusos en ${formatTime(secs)} amb ${fails} errors.`} score={formatTime(secs)} onRestart={() => { setRound(0); setFails(0); setDone(false); setPos(Array.from({ length: 5 }, () => Math.floor(Math.random() * 25))); }} />
      )}
    </div>
  );
}

/* CADENAT */
export function GameLock({ onComplete, config }: GameProps) {
  const [SECRET] = useState<number[]>(() => { const parts = String(config?.code || "").split(/[,\s]+/).map((p) => parseInt(p)).filter((n) => !isNaN(n) && n >= 0 && n <= 9); return parts.length >= 2 && parts.length <= 5 ? parts : [7, 4, 6]; });
  const [HINTS] = useState<string[]>(() => { const h = String(config?.hints || "").split("|").map((s) => s.trim()).filter(Boolean); return h.length === SECRET.length ? h : SECRET.length === 3 ? ["3 + 4 = ?", "10 − 6 = ?", "2 × 3 = ?"] : SECRET.map((_, i) => `Xifra ${i + 1}`); });
  const [digits, setDigits] = useState<number[]>(() => SECRET.map(() => 0));
  const [tries, setTries] = useState(0);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);

  const ch = (i: number, d: number) => { if (won) return; const nd = [...digits]; nd[i] = (nd[i] + d + 10) % 10; setDigits(nd); };
  const check = () => { setTries((t) => t + 1); if (digits.every((v, i) => v === SECRET[i])) { setWon(true); onComplete(500 - tries * 20 - secs * 2, `${tries + 1} intents`); } };

  return (
    <div>
      <GameHeader instruction={`Desxifra el cadenat de ${SECRET.length} xifres amb les pistes.`} secs={secs} />
      {!won ? (
        <div className="text-center">
          <div className="grid gap-2 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200" style={{ gridTemplateColumns: `repeat(${SECRET.length}, minmax(0,1fr))` }}>
            {HINTS.map((h, i) => (<div key={i} className="rounded-xl bg-white p-2 ring-1 ring-stone-200"><p className="text-[10px] font-black uppercase text-stone-400">Xifra {i + 1}</p><p className="text-sm font-black">{h}</p></div>))}
          </div>
          <div className="mx-auto mt-4 flex max-w-[340px] justify-center gap-3">
            {digits.map((d, i) => (
              <div key={i} className="flex flex-col items-center rounded-2xl border-2 bg-white p-2">
                <button onClick={() => ch(i, 1)} className="rounded-lg bg-stone-100 px-4 py-1 text-lg font-black hover:bg-stone-200">▲</button>
                <span className="py-1 text-4xl font-black tabular-nums">{d}</span>
                <button onClick={() => ch(i, -1)} className="rounded-lg bg-stone-100 px-4 py-1 text-lg font-black hover:bg-stone-200">▼</button>
              </div>
            ))}
          </div>
          <button onClick={check} className="mt-4 rounded-xl bg-stone-900 px-8 py-2.5 font-black text-white hover:bg-stone-700">🔓 Prova la combinació</button>
          <p className="mt-2 text-xs font-bold text-stone-500">{tries} intents</p>
        </div>
      ) : (
        <WinBanner title="Cadenat obert! 🔓" subtitle={`Codi ${SECRET.join("-")} en ${tries} intents.`} score={formatTime(secs)} onRestart={() => { setDigits(SECRET.map(() => 0)); setTries(0); setWon(false); }} />
      )}
    </div>
  );
}

/* STROOP */
const STROOP_OPTS = ["Vermell", "Blau", "Verd", "Groc", "Lila", "Marró"];
const STROOP_HEX: Record<string, string> = { Vermell: "#ef4444", Blau: "#0ea5e9", Verd: "#22c55e", Groc: "#eab308", Lila: "#a855f7", Marró: "#92400e" };
type StroopRound = { w: string; c: string; col: string };

/** Genera 10 rondes on: la paraula NO coincideix amb la tinta, cap paraula ni cap tinta
 *  es repeteix a rondes seguides, i cap paraula ni tinta surt més de 2 vegades. */
function genStroop(): StroopRound[] {
  for (let attempt = 0; attempt < 300; attempt++) {
    const rounds: StroopRound[] = [];
    const wordUse: Record<string, number> = {};
    const inkUse: Record<string, number> = {};
    let ok = true;
    for (let i = 0; i < 10; i++) {
      const prev = rounds[i - 1];
      const words = shuffle(STROOP_OPTS).filter((w) => (wordUse[w] || 0) < 2 && (!prev || w !== prev.w));
      let placed = false;
      for (const w of words) {
        const inks = shuffle(STROOP_OPTS).filter((c) => c !== w && (inkUse[c] || 0) < 2 && (!prev || c !== prev.c));
        if (inks.length) {
          const c = inks[0];
          rounds.push({ w: w.toUpperCase(), c, col: STROOP_HEX[c] });
          wordUse[w] = (wordUse[w] || 0) + 1;
          inkUse[c] = (inkUse[c] || 0) + 1;
          placed = true;
          break;
        }
      }
      if (!placed) { ok = false; break; }
    }
    if (ok) return rounds;
  }
  // Plan B (molt improbable): rotació simple sense repeticions
  return Array.from({ length: 10 }, (_, i) => {
    const w = STROOP_OPTS[i % 6];
    const c = STROOP_OPTS[(i + 2 + Math.floor(i / 6)) % 6];
    return { w: w.toUpperCase(), c, col: STROOP_HEX[c] };
  });
}

export function GameStroop({ onComplete }: GameProps) {
  const [rounds, setRounds] = useState<StroopRound[]>(() => genStroop());
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feed, setFeed] = useState<null | string>(null);
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(30);

  useEffect(() => {
    if (done) return;
    if (time <= 0) { setDone(true); onComplete(score * 80, `${score}/10`); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000); return () => clearTimeout(t);
  }, [time, done]);

  const pick = (o: string) => {
    if (feed || done) return;
    const ok = o === rounds[idx].c; setFeed(o); if (ok) setScore((s) => s + 1);
    setTimeout(() => { setFeed(null); if (idx + 1 >= 10) { setDone(true); onComplete((score + (ok ? 1 : 0)) * 80, `${score + (ok ? 1 : 0)}/10`); } else setIdx(idx + 1); }, 450);
  };

  return (
    <div>
      <GameHeader instruction="No llegeixis la paraula! Prem el COLOR de la tinta. Ex: VERMELL en blau → prem BLAU." extra={<span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">⏱ {time}s · {idx + 1}/10</span>} />
      {!done ? (
        <div className="text-center">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200"><p className="text-5xl font-black tracking-wide" style={{ color: rounds[idx].col }}>{rounds[idx].w}</p><p className="mt-1 text-xs font-bold text-stone-400">De quin color està pintada?</p></div>
          <div className="mx-auto mt-3 grid max-w-[340px] grid-cols-2 gap-2">
            {STROOP_OPTS.map((o) => (<button key={o} onClick={() => pick(o)} className={`flex items-center gap-2 rounded-xl px-4 py-3 font-black ring-1 transition-all active:scale-95 ${feed === o ? (o === rounds[idx].c ? "bg-emerald-500 text-white" : "animate-shake bg-red-500 text-white") : "bg-white ring-stone-200 hover:bg-stone-50"}`}><span className="h-4 w-4 rounded-full" style={{ background: STROOP_HEX[o] }} /> {o}</button>))}
          </div>
          <p className="mt-2 text-xs font-black text-stone-500">Encerts: {score}</p>
        </div>
      ) : (
        <WinBanner title={score >= 8 ? "Cervell flexible! 🌀" : "Bon esforç!"} subtitle={`${score} de 10 encerts.`} score={`${score}/10`} onRestart={() => { setRounds(genStroop()); setIdx(0); setScore(0); setDone(false); setTime(30); }} />
      )}
    </div>
  );
}

/* LLUMS */
function flipAt(g: boolean[][], r: number, c: number) {
  [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => { const nr = r + dr, nc = c + dc; if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) g[nr][nc] = !g[nr][nc]; });
}
function genLights(): boolean[][] {
  let g = Array.from({ length: 4 }, () => Array(4).fill(false));
  for (let i = 0; i < 10; i++) flipAt(g, Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
  if (g.every((row) => row.every((v) => !v))) flipAt(g, 1, 1);
  return g;
}
export function GameLights({ onComplete }: GameProps) {
  const [g, setG] = useState<boolean[][]>(() => genLights());
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);

  const click = (r: number, c: number) => {
    if (won) return;
    const ng = g.map((row) => [...row]); flipAt(ng, r, c); setG(ng); setMoves((m) => m + 1);
    if (ng.every((row) => row.every((v) => !v))) { setWon(true); onComplete(Math.max(100, 700 - moves * 15 - secs * 5), `${moves + 1} movs`); }
  };

  return (
    <div>
      <GameHeader instruction="Apaga tots els llums 💡. Cada toc canvia la casella i les veïnes." secs={secs} extra={<span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black">{moves} movs</span>} />
      {!won ? (
        <div className="mx-auto grid max-w-[280px] grid-cols-4 gap-2 rounded-2xl bg-stone-900 p-3">{g.map((row, r) => row.map((on, c) => (<button key={`${r}-${c}`} onClick={() => click(r, c)} className={`flex aspect-square items-center justify-center rounded-xl text-2xl transition-all active:scale-95 ${on ? "bg-yellow-300 shadow-[0_0_12px_#fde047]" : "bg-stone-700"}`}>{on ? "💡" : ""}</button>)))}</div>
      ) : (
        <WinBanner title="Tot a les fosques! 🌙" subtitle={`En ${moves} moviments.`} score={`${moves} movs`} onRestart={() => { setG(genLights()); setMoves(0); setWon(false); }} />
      )}
    </div>
  );
}

/* ZONA VERDA */
export function GameTiming({ onComplete }: GameProps) {
  const [pos, setPos] = useState(0);
  const [round, setRound] = useState(1);
  const [hits, setHits] = useState(0);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  const posRef = useRef(0);
  const dirRef = useRef(1);

  useEffect(() => {
    if (done) return;
    const speed = 2 + round * 0.9;
    const t = setInterval(() => {
      let n = posRef.current + dirRef.current * speed;
      if (n >= 100) { n = 100; dirRef.current = -1; }
      if (n <= 0) { n = 0; dirRef.current = 1; }
      posRef.current = n;
      setPos(n);
    }, 16);
    return () => clearInterval(t);
  }, [done, round]);

  const stop = () => {
    if (done || msg) return;
    const inZone = posRef.current >= 42 && posRef.current <= 58;
    if (inZone) setHits((h) => h + 1);
    setMsg(inZone ? "✅ A dins!" : "❌ A fora! Ajusta l'ull.");
    setTimeout(() => { setMsg(""); if (round >= 5) { setDone(true); const h = hits + (inZone ? 1 : 0); onComplete(h * 150, `${h}/5`); } else setRound(round + 1); }, 700);
  };

  return (
    <div>
      <GameHeader instruction="Prem ATURA quan el cursor sigui a la zona verda central. 5 intents." extra={<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">{round}/5 · ✅{hits}</span>} />
      {!done ? (
        <div className="text-center">
          <div className="relative h-12 overflow-hidden rounded-full bg-stone-200 ring-1 ring-stone-300"><div className="absolute left-[42%] top-0 h-full w-[16%] bg-emerald-400" /><div className="absolute top-0 h-full w-[3px] bg-stone-900" style={{ left: `${pos}%` }} /></div>
          <p className="mt-1 text-xs font-bold text-stone-500">Velocitat x{round} · cada ronda més ràpid</p>
          <button onClick={stop} className="mt-4 w-full rounded-2xl bg-emerald-600 py-4 text-xl font-black text-white hover:bg-emerald-700 active:scale-[0.98]">⏹ ATURA</button>
          {msg && <p className="animate-pop-in mt-2 text-lg font-black">{msg}</p>}
        </div>
      ) : (
        <WinBanner title={hits >= 3 ? "Pols de cirurgiana! 🎯" : "Bon pols!"} subtitle={`${hits} de 5 a la zona verda.`} score={`${hits}/5`} onRestart={() => { setRound(1); setHits(0); setDone(false); setPos(0); }} />
      )}
    </div>
  );
}

/* RECICLA */
const RECYCLE_ITEMS = [
  { e: "🍾", n: "Ampolla de vidre", b: "Verd" }, { e: "📰", n: "Diari", b: "Blau" }, { e: "🥫", n: "Llauna", b: "Groc" }, { e: "🍌", n: "Pela de plàtan", b: "Marró" }, { e: "📦", n: "Caixa de cartró", b: "Blau" },
  { e: "🥤", n: "Got de plàstic", b: "Groc" }, { e: "🍷", n: "Copa trencada", b: "Verd" }, { e: "🍎", n: "Restes de poma", b: "Marró" }, { e: "🧴", n: "Pot de xampú", b: "Groc" }, { e: "📝", n: "Full usat", b: "Blau" },
];
const BINS = [{ n: "Groc", e: "♻️", d: "Plàstic", c: "bg-yellow-400" }, { n: "Blau", e: "📄", d: "Paper", c: "bg-blue-500" }, { n: "Verd", e: "🍾", d: "Vidre", c: "bg-emerald-500" }, { n: "Marró", e: "🌱", d: "Orgànic", c: "bg-amber-700" }];
export function GameRecycle({ onComplete }: GameProps) {
  const [order] = useState(() => shuffle(RECYCLE_ITEMS));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feed, setFeed] = useState<null | boolean>(null);
  const [done, setDone] = useState(false);

  const pick = (b: string) => {
    if (feed !== null || done) return;
    const ok = b === order[idx].b; setFeed(ok); if (ok) setScore((s) => s + 1);
    setTimeout(() => { setFeed(null); if (idx + 1 >= order.length) { setDone(true); onComplete((score + (ok ? 1 : 0)) * 80, `${score + (ok ? 1 : 0)}/10`); } else setIdx(idx + 1); }, 650);
  };

  return (
    <div>
      <GameHeader instruction="Classifica cada residu al seu contenidor." extra={<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">{idx + 1}/10 · ⭐{score}</span>} />
      {!done ? (
        <div className="text-center">
          <div className={`mx-auto max-w-[220px] rounded-2xl p-5 ring-1 ${feed === true ? "bg-emerald-100 ring-emerald-400" : feed === false ? "animate-shake bg-red-100 ring-red-300" : "bg-white ring-stone-200"}`}>
            <div className="text-6xl">{order[idx].e}</div><p className="mt-2 font-black">{order[idx].n}</p>
            {feed !== null && <p className="mt-1 text-sm font-black">{feed ? "✅ Bé!" : `❌ Era ${order[idx].b}`}</p>}
          </div>
          <div className="mx-auto mt-3 grid max-w-[340px] grid-cols-2 gap-2">
            {BINS.map((b) => (<button key={b.n} onClick={() => pick(b.n)} className={`flex items-center gap-2 rounded-xl p-2.5 text-left font-black text-white transition-all active:scale-95 ${b.c}`}><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/25 text-xl">{b.e}</span><span className="text-sm leading-tight">{b.n}<br /><span className="text-[11px] font-bold opacity-80">{b.d}</span></span></button>))}
          </div>
        </div>
      ) : (
        <WinBanner title={score >= 8 ? "Eco-heroïna! 🌍" : "Bon reciclatge!"} subtitle={`${score} de 10 ben classificats.`} score={`${score}/10`} onRestart={() => { setIdx(0); setScore(0); setDone(false); }} />
      )}
    </div>
  );
}

/* MEMÒRIA FLASH */
const FLASH_EMOJIS = ["🐶", "🍕", "🚀", "🌈", "🎸", "🐱", "⚽", "🍩"];
export function GameFlash({ onComplete, config }: GameProps) {
  const [POOL] = useState<string[]>(() => { const list = String(config?.emojis || "").split(",").map((s) => s.trim()).filter(Boolean); return list.length >= 6 ? list.slice(0, 8) : FLASH_EMOJIS; });
  const lengths = [3, 4, 5];
  const [level, setLevel] = useState(1);
  const [seq, setSeq] = useState<string[]>(() => shuffle(POOL).slice(0, 3));
  const [show, setShow] = useState(true);
  const [input, setInput] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(3);

  useEffect(() => {
    setShow(true); setCount(3);
    const c = setInterval(() => { setCount((prev) => { if (prev <= 1) { clearInterval(c); setShow(false); return 0; } return prev - 1; }); }, 1000);
    return () => clearInterval(c);
  }, [level, seq]);

  const press = (e: string) => {
    if (show || done) return;
    const ni = [...input, e]; setInput(ni);
    const idx = ni.length - 1;
    if (ni[idx] !== seq[idx]) { setTimeout(() => setInput([]), 500); return; }
    if (ni.length === seq.length) {
      setTimeout(() => { setInput([]); if (level >= 3) { setDone(true); onComplete(600, "3/3 nivells"); } else { setLevel(level + 1); setSeq(shuffle(POOL).slice(0, lengths[level])); } }, 700);
    }
  };

  return (
    <div>
      <GameHeader instruction="Memoritza la seqüència i repeteix-la en ordre. 3 nivells (3, 4 i 5 emojis)." extra={<span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-800">Nivell {level}/3</span>} />
      {!done ? (
        <div className="text-center">
          {show ? (
            <div className="rounded-2xl bg-indigo-600 p-6 text-white"><p className="text-xs font-black uppercase opacity-70">Memoritza… {count}s</p><div className="mt-2 flex justify-center gap-2 text-5xl">{seq.map((e, i) => (<span key={i} className="animate-pop-in">{e}</span>))}</div></div>
          ) : (
            <>
              <div className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-stone-100 p-3 ring-1 ring-stone-200">{input.length === 0 && <span className="text-sm font-bold text-stone-400">El teu torn: toca en ordre…</span>}{input.map((e, i) => (<span key={i} className="text-3xl">{e}</span>))}</div>
              <div className="mx-auto mt-3 grid max-w-[280px] grid-cols-4 gap-2">{POOL.map((e) => (<button key={e} onClick={() => press(e)} className="flex aspect-square items-center justify-center rounded-xl bg-white text-3xl ring-1 ring-stone-200 hover:bg-indigo-50 active:scale-95">{e}</button>))}</div>
            </>
          )}
        </div>
      ) : (
        <WinBanner title="Memòria fotogràfica! 📸" subtitle="Has superat els 3 nivells." score="3/3" onRestart={() => { setLevel(1); setSeq(shuffle(POOL).slice(0, 3)); setDone(false); setInput([]); }} />
      )}
    </div>
  );
}

/* DAU 21 */
export function GameDice21({ onComplete }: GameProps) {
  const [ps, setPs] = useState<number[]>([]);
  const [cs, setCs] = useState<number[]>([]);
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [msg, setMsg] = useState("Tira el dau. Acosta't a 21 sense passar-te.");
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState("");
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const roll = () => Math.ceil(Math.random() * 6);

  const playerStand = (npArg?: number[]) => {
    const player = npArg || ps; if (!player.length) return;
    let cpu: number[] = []; while (sum(cpu) < 16) cpu.push(roll());
    setCs(cpu); setPhase("done");
    const pSum = sum(player), cSum = sum(cpu);
    if (cSum > 21 || pSum > cSum) { setResult("🏆 HAS GUANYAT!"); onComplete(500, `${pSum} vs ${cSum}`); }
    else if (pSum === cSum) { setResult("🤝 Empat!"); onComplete(250, "empat"); }
    else setResult("🤖 Guanya la màquina.");
    setMsg(`Tu ${pSum} · CPU ${cSum}`);
  };
  const playerRoll = () => {
    if (phase === "done" || rolling) return;
    setRolling(true);
    setTimeout(() => {
      const d = roll(); const np = [...ps, d]; setPs(np); setRolling(false);
      if (sum(np) > 21) { setPhase("done"); setResult("💥 T'has passat! Guanya la màquina."); setMsg(`T'has passat amb ${sum(np)}.`); }
      else if (sum(np) === 21) playerStand(np);
      else setMsg(`Portes ${sum(np)}. Una altra o et plantes?`);
    }, 400);
  };
  const reset = () => { setPs([]); setCs([]); setPhase("play"); setResult(""); setMsg("Tira el dau. Acosta't a 21 sense passar-te."); };
  const Dice = ({ v }: { v: number }) => (<span className="animate-pop-in flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm ring-1 ring-stone-200">{"⚀⚁⚂⚃⚄⚅"[v - 1]}</span>);

  return (
    <div>
      <GameHeader instruction="Blackjack amb daus 🎲: suma 21 o queda't a prop. La CPU es planta a 16." />
      <div className="rounded-2xl bg-emerald-900 p-4 text-white">
        <div className="flex items-center justify-between"><p className="text-xs font-black uppercase opacity-70">Tu: {sum(ps)}</p><p className="text-xs font-black uppercase opacity-70">CPU: {phase === "done" ? sum(cs) : "?"}</p></div>
        <div className="mt-2 flex min-h-[52px] flex-wrap gap-1.5">{ps.map((d, i) => (<Dice key={i} v={d} />))}{ps.length === 0 && <span className="text-sm font-bold opacity-50">Sense tirades encara</span>}</div>
        {phase === "done" && <div className="mt-2 flex flex-wrap gap-1.5 border-t border-white/20 pt-2">{cs.map((d, i) => (<Dice key={i} v={d} />))}</div>}
        <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-bold">{rolling ? "🎲 Girant…" : msg}</p>
        {result && <p className="animate-pop-in mt-2 text-center text-2xl font-black">{result}</p>}
      </div>
      {phase === "play" ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={playerRoll} disabled={rolling} className="rounded-xl bg-emerald-600 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-50">🎲 Tirar</button>
          <button onClick={() => playerStand()} disabled={!ps.length || rolling} className="rounded-xl bg-stone-900 py-3 font-black text-white hover:bg-stone-700 disabled:opacity-40">✋ Plantar-se</button>
        </div>
      ) : (<div className="mt-3"><WinBanner title="Ronda acabada" subtitle={msg} score={result} onRestart={reset} /></div>)}
    </div>
  );
}

/* ORDENA LA NOSTRA HISTÒRIA */
const STORY_DEFAULT = ["Vas néixer tu", "Primer estiu a la platja", "El teu primer dia d'escola", "El gran viatge juntes", "Avui, amb aquestes 30 esferes"];
export function GameStory({ onComplete, config }: GameProps) {
  const [EVENTS] = useState<string[]>(() => { const list = String(config?.events || "").split("\n").map((s) => s.trim()).filter(Boolean); return list.length >= 3 ? list.slice(0, 7) : STORY_DEFAULT; });
  const mk = () => { let s = shuffle(EVENTS); if (s.join() === EVENTS.join()) s = [...s.slice(1), s[0]]; return s; };
  const [pool, setPool] = useState<string[]>(mk);
  const [placed, setPlaced] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [err, setErr] = useState(false);
  const [fails, setFails] = useState(0);

  const pick = (ev: string) => {
    if (won) return;
    if (ev === EVENTS[placed.length]) { const np = [...placed, ev]; setPlaced(np); setPool(pool.filter((p) => p !== ev)); if (np.length === EVENTS.length) { setWon(true); onComplete(500 - fails * 30, `${fails} errors`); } }
    else { setFails((f) => f + 1); setErr(true); setTimeout(() => setErr(false), 400); }
  };

  return (
    <div>
      <GameHeader instruction="Ordena els capítols de la nostra història del primer a l'últim. Toca el que va a continuació." extra={<span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800">{placed.length}/{EVENTS.length}</span>} />
      <div className="relative ml-3 border-l-2 border-dashed border-rose-300 pl-5 text-left">
        {placed.map((p, i) => (<div key={i} className="animate-pop-in relative mb-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-900 ring-1 ring-rose-200"><span className="absolute -left-[31px] top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">{i + 1}</span>{p}</div>))}
        {!won && (<div className={`relative mb-2 rounded-xl border-2 border-dashed px-3 py-2 text-sm font-bold ${err ? "animate-shake border-red-400 bg-red-50 text-red-700" : "border-rose-300 text-rose-400"}`}><span className="absolute -left-[31px] top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-200 text-[10px] font-black text-rose-700">{placed.length + 1}</span>{err ? "Aquest no va aquí…" : "Què va passar després?"}</div>)}
      </div>
      {!won ? (
        <div className="mt-3 grid gap-2">{pool.map((ev) => (<button key={ev} onClick={() => pick(ev)} className="rounded-xl bg-white px-4 py-3 text-left text-sm font-bold ring-1 ring-stone-200 transition-all hover:bg-rose-50 active:scale-[0.98]">📖 {ev}</button>))}</div>
      ) : (
        <div className="mt-3"><WinBanner title="La nostra història, en ordre 💛" subtitle="I el millor és que encara no s'ha acabat." score={`${fails} errors`} onRestart={() => { setPool(mk()); setPlaced([]); setWon(false); setFails(0); }} /></div>
      )}
    </div>
  );
}

/* ENDEVINALLA (resposta escrita) */
function normalize(s: string) {
  return s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9ç\s]/g, "");
}
export function GameRiddle({ onComplete, config }: GameProps) {
  const question = String(config?.question || "").trim();
  const answers = String(config?.answer || "")
    .split(",")
    .map((a) => normalize(a))
    .filter(Boolean);
  const [value, setValue] = useState("");
  const [tries, setTries] = useState(0);
  const [feed, setFeed] = useState<"" | "no">("");
  const [won, setWon] = useState(false);

  const send = () => {
    if (!value.trim() || won) return;
    const nt = tries + 1;
    setTries(nt);
    const ok = answers.length === 0 ? false : answers.includes(normalize(value));
    if (ok) {
      setWon(true);
      onComplete(Math.max(100, 400 - (nt - 1) * 60), `${nt} ${nt === 1 ? "intent" : "intents"}`);
    } else {
      setFeed("no");
      setTimeout(() => setFeed(""), 500);
    }
  };
  const reset = () => { setValue(""); setTries(0); setFeed(""); setWon(false); };

  return (
    <div>
      <GameHeader instruction="Pensa-hi bé abans de respondre." extra={tries > 0 ? <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">{tries} {tries === 1 ? "intent" : "intents"}</span> : undefined} />
      {!won ? (
        <div className="text-center">
          {question && <div className="whitespace-pre-line rounded-2xl bg-stone-900 p-5 text-lg font-black leading-snug text-white">{question}</div>}
          <div className={`mx-auto mt-4 flex max-w-[320px] gap-2 ${feed === "no" ? "animate-shake" : ""}`}>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escriu la teva resposta…"
              className={`w-full rounded-xl border-2 px-4 py-2.5 text-center text-lg font-black outline-none ${feed === "no" ? "border-red-400" : "border-stone-200 focus:border-amber-400"}`}
            />
            <button onClick={send} className="shrink-0 rounded-xl bg-amber-400 px-5 font-black text-stone-900 hover:bg-amber-300">OK</button>
          </div>
          {feed === "no" && <p className="mt-2 text-sm font-bold text-red-600">No és això… torna-ho a pensar!</p>}
        </div>
      ) : (
        <WinBanner title="Correcte! 🎉" subtitle="Has endevinat la connexió." score={`${tries} ${tries === 1 ? "intent" : "intents"}`} onRestart={reset} />
      )}
    </div>
  );
}

/* EL GLOBUS: toca'l per no deixar-lo caure 20 segons */
export function GameBalloon({ onComplete, config }: GameProps) {
  const EMO = String(config?.emoji || "🎈");
  const NEED = 20;
  const boxRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "won" | "lost">("idle");
  const [secs, setSecs] = useState(NEED);
  const [pos, setPos] = useState({ x: 50, y: 40 });
  const phaseRef = useRef(phase);
  const posRef = useRef({ x: 50, y: 40 });
  const velRef = useRef({ x: 18, y: -40 });
  phaseRef.current = phase;

  const start = () => {
    posRef.current = { x: 50, y: 40 };
    velRef.current = { x: 22, y: -55 };
    setPos({ x: 50, y: 40 });
    setSecs(NEED);
    phaseRef.current = "play";
    setPhase("play");
  };

  useEffect(() => {
    if (phase !== "play") return;
    if (secs <= 0) {
      phaseRef.current = "won";
      setPhase("won");
      onComplete(500, `${NEED}s`);
      return;
    }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secs]);

  useEffect(() => {
    if (phase !== "play") return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      if (phaseRef.current !== "play") return;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      velRef.current.y += 160 * dt; // gravetat
      velRef.current.x *= 0.995;
      let x = posRef.current.x + velRef.current.x * dt;
      let y = posRef.current.y + velRef.current.y * dt;
      if (x < 8) { x = 8; velRef.current.x = Math.abs(velRef.current.x) * 0.6; }
      if (x > 92) { x = 92; velRef.current.x = -Math.abs(velRef.current.x) * 0.6; }
      if (y < 6) { y = 6; velRef.current.y = Math.abs(velRef.current.y) * 0.4; }
      if (y > 92) {
        phaseRef.current = "lost";
        setPhase("lost");
        setPos({ x, y: 92 });
        return;
      }
      posRef.current = { x, y };
      setPos({ x, y });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const boost = () => {
    if (phaseRef.current !== "play") return;
    velRef.current.y = -90 - Math.random() * 25;
    velRef.current.x += (Math.random() - 0.5) * 50;
  };

  return (
    <div>
      <GameHeader
        instruction={`Toca el globus ${EMO} per no deixar-lo caure. Mantén-lo a l'aire ${NEED} segons!`}
        extra={<span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-black text-pink-800">⏱ {secs}s</span>}
      />
      <div
        ref={boxRef}
        onPointerDown={boost}
        style={{ touchAction: "manipulation" }}
        className="relative mx-auto h-72 w-full max-w-[340px] overflow-hidden rounded-2xl bg-gradient-to-b from-sky-200 to-sky-50 ring-1 ring-sky-200"
      >
        <div className="absolute inset-x-0 bottom-0 h-3 bg-emerald-300/70" />
        <span
          className="absolute select-none text-5xl"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)", filter: "drop-shadow(0 6px 8px rgba(0,0,0,.18))" }}
        >
          {EMO}
        </span>
        {phase === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={start} className="rounded-2xl bg-pink-500 px-6 py-3 text-lg font-black text-white shadow-md active:scale-[0.98]">
              Deixa anar el globus!
            </button>
          </div>
        )}
      </div>
      {phase === "play" && <p className="mt-2 text-center text-xs font-bold text-stone-500">Toca el requadre (o el globus) per donar-li un impuls cap amunt</p>}
      {phase === "won" && (
        <div className="mt-4">
          <WinBanner title="No ha caigut ni un cop! 🎈" subtitle={`L'has tingut a l'aire ${NEED} segons.`} score={`${NEED}s`} onRestart={start} />
        </div>
      )}
      {phase === "lost" && (
        <div className="mt-4 rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-center">
          <h3 className="text-xl font-black text-red-800">S'ha desinflat… 💥</h3>
          <p className="mt-1 text-sm font-bold text-red-700">El globus ha tocat terra. Torna-ho a provar!</p>
          <button onClick={start} className="mt-3 rounded-xl bg-red-600 px-5 py-2 font-bold text-white">Torna-ho a provar</button>
        </div>
      )}
    </div>
  );
}
