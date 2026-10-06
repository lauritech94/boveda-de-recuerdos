import { useEffect, useRef, useState } from "react";
import { GameProps, GameHeader, WinBanner, useElapsed, shuffle, formatTime, safeEmoji } from "./common";

/* SOPA DE LLETRES */
const SOUP_WORDS = ["GAT", "PA", "SOL"];
const SOUP_GRID = [
  ["G", "A", "T", "U", "X", "M"],
  ["L", "O", "R", "E", "S", "A"],
  ["P", "A", "D", "L", "O", "R"],
  ["E", "S", "O", "L", "T", "C"],
  ["R", "I", "U", "N", "A", "O"],
  ["T", "O", "M", "A", "T", "E"],
];
const SOUP_CELLS: Record<string, string[]> = { GAT: ["0-0", "0-1", "0-2"], PA: ["2-0", "2-1"], SOL: ["3-1", "3-2", "3-3"] };
export function GameSoup({ onComplete }: GameProps) {
  const [sel, setSel] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);

  const toggleCell = (r: number, c: number) => {
    if (won) return;
    const key = `${r}-${c}`;
    if (found.some((w) => SOUP_CELLS[w].includes(key))) return;
    if (sel.includes(key)) setSel(sel.filter((s) => s !== key));
    else {
      const ns = [...sel, key]; setSel(ns);
      for (const w of SOUP_WORDS) {
        if (!found.includes(w) && SOUP_CELLS[w].every((cell) => ns.includes(cell))) {
          const nf = [...found, w]; setFound(nf); setSel([]);
          if (nf.length === SOUP_WORDS.length) { setWon(true); onComplete(600 - secs, "3 paraules"); }
          return;
        }
      }
      if (ns.length > 6) setSel([]);
    }
  };
  const isSel = (k: string) => sel.includes(k);
  const isFound = (k: string) => found.some((w) => SOUP_CELLS[w].includes(k));

  return (
    <div>
      <GameHeader instruction="Troba GAT, PA i SOL. Toca les seves lletres en ordre. Es pinten de verd." secs={secs} extra={<span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-800">{found.length}/3</span>} />
      {!won ? (
        <>
          <div className="mx-auto grid max-w-[320px] grid-cols-6 gap-1.5">
            {SOUP_GRID.map((row, r) => row.map((ch, c) => { const k = `${r}-${c}`; return (<button key={k} onClick={() => toggleCell(r, c)} className={`flex aspect-square items-center justify-center rounded-lg text-lg font-black transition-all active:scale-95 ${isFound(k) ? "bg-emerald-500 text-white" : isSel(k) ? "bg-amber-400 text-white ring-2 ring-amber-600" : "bg-white ring-1 ring-stone-200 hover:bg-amber-50"}`}>{ch}</button>); }))}
          </div>
          <div className="mt-3 flex justify-center gap-2">{SOUP_WORDS.map((w) => (<span key={w} className={`rounded-full px-3 py-1 text-xs font-black ${found.includes(w) ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-600"}`}>{found.includes(w) ? `✓ ${w}` : w}</span>))}</div>
          <button onClick={() => setSel([])} className="mx-auto mt-2 block text-xs font-bold text-stone-500 underline">Neteja la selecció</button>
        </>
      ) : (
        <WinBanner title="Sopa completada! 🍲" subtitle={`Has trobat les 3 paraules en ${formatTime(secs)}.`} score={formatTime(secs)} onRestart={() => { setFound([]); setSel([]); setWon(false); }} />
      )}
    </div>
  );
}

/* CÀLCUL */
type Q = { q: string; a: number };
function genQs(): Q[] {
  const qs: Q[] = [];
  for (let i = 0; i < 8; i++) {
    const t = Math.floor(Math.random() * 3);
    if (t === 0) { const a = 5 + Math.floor(Math.random() * 40), b = 3 + Math.floor(Math.random() * 20); qs.push({ q: `${a} + ${b}`, a: a + b }); }
    else if (t === 1) { const a = 10 + Math.floor(Math.random() * 50), b = 2 + Math.floor(Math.random() * 20); qs.push({ q: `${a} − ${b}`, a: a - b }); }
    else { const a = 2 + Math.floor(Math.random() * 9), b = 2 + Math.floor(Math.random() * 9); qs.push({ q: `${a} × ${b}`, a: a * b }); }
  }
  return qs;
}
export function GameMath({ onComplete }: GameProps) {
  const [qs, setQs] = useState<Q[]>(() => genQs());
  const [idx, setIdx] = useState(0);
  const [val, setVal] = useState("");
  const [score, setScore] = useState(0);
  const [feed, setFeed] = useState<"" | "ok" | "no">("");
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(45);

  useEffect(() => {
    if (done) return;
    if (time <= 0) { setDone(true); onComplete(score * 100, `${score}/8`); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000); return () => clearTimeout(t);
  }, [time, done]);

  const send = () => {
    if (!val || feed) return;
    const ok = parseInt(val) === qs[idx].a;
    setFeed(ok ? "ok" : "no"); if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      setFeed(""); setVal("");
      if (idx + 1 >= 8) { setDone(true); onComplete((score + (ok ? 1 : 0)) * 100, `${score + (ok ? 1 : 0)}/8`); } else setIdx(idx + 1);
    }, 600);
  };
  const reset = () => { setQs(genQs()); setIdx(0); setVal(""); setScore(0); setFeed(""); setDone(false); setTime(45); };

  return (
    <div>
      <GameHeader instruction="Resol 8 operacions abans que s'acabi el temps (45s)." extra={<span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">⏱ {time}s · ⭐ {score}</span>} />
      {!done ? (
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-stone-400">Operació {idx + 1}/8</p>
          <p className={`mx-auto mt-2 inline-block rounded-2xl px-8 py-4 text-4xl font-black tabular-nums ${feed === "ok" ? "bg-emerald-100 text-emerald-700" : feed === "no" ? "animate-shake bg-red-100 text-red-700" : "bg-stone-900 text-white"}`}>{qs[idx].q} = ?</p>
          <div className="mx-auto mt-4 flex max-w-[280px] gap-2">
            <input value={val} onChange={(e) => setVal(e.target.value.replace(/[^0-9-]/g, ""))} onKeyDown={(e) => e.key === "Enter" && send()} type="number" autoFocus placeholder="?" className="w-full rounded-xl border-2 border-stone-200 px-4 py-2.5 text-center text-2xl font-black outline-none focus:border-orange-400" />
            <button onClick={send} className="shrink-0 rounded-xl bg-orange-500 px-5 font-black text-white hover:bg-orange-600">OK</button>
          </div>
        </div>
      ) : (
        <WinBanner title={score >= 6 ? "Calculadora humana! 🧮" : score >= 4 ? "Gens malament!" : "Continua practicant!"} subtitle={`Has encertat ${score} de 8.`} score={`${score}/8`} onRestart={reset} />
      )}
    </div>
  );
}

/* DIFERÈNCIES */
const BASE = ["🍎", "🍎", "🍎", "🍐", "🍎", "🍎", "🐶", "🍎", "🍎", "🍎", "🍎", "🍎", "🍎", "🍎", "🌵", "🍎", "🍎", "🍎", "🍎", "🍎", "🎈", "🍎", "🍎", "🍎", "🍎"];
const RIGHT = ["🍎", "🍎", "🍎", "🍏", "🍎", "🍎", "🐱", "🍎", "🍎", "🍎", "🍎", "🍎", "🍎", "🍎", "🌴", "🍎", "🍎", "🍎", "🍎", "🍎", "🎈", "🍎", "🍎", "🍎", "🍎"];
const DIFFS = [3, 6, 14];
export function GameDiff({ onComplete }: GameProps) {
  const [found, setFound] = useState<number[]>([]);
  const [fails, setFails] = useState(0);
  const [won, setWon] = useState(false);
  const { secs } = useElapsed(!won);

  const click = (i: number) => {
    if (won || found.includes(i)) return;
    if (DIFFS.includes(i)) { const nf = [...found, i]; setFound(nf); if (nf.length === 3) { setWon(true); onComplete(600 - secs * 5 - fails * 20, formatTime(secs)); } }
    else setFails((f) => f + 1);
  };
  const Grid = ({ arr, clickable }: { arr: string[]; clickable?: boolean }) => (
    <div className="grid grid-cols-5 gap-1">
      {arr.map((e, i) => (<button key={i} disabled={!clickable} onClick={() => clickable && click(i)} className={`flex aspect-square items-center justify-center rounded-lg text-xl ${found.includes(i) && clickable ? "bg-emerald-200 ring-2 ring-emerald-500" : "bg-white ring-1 ring-stone-200"} ${clickable ? "hover:bg-amber-50 active:scale-95" : ""}`}>{e}</button>))}
    </div>
  );

  return (
    <div>
      <GameHeader instruction="Hi ha 3 diferències entre esquerra i dreta. Toca-les a la graella DRETA." secs={secs} extra={<span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-black text-pink-800">{found.length}/3 · ❌{fails}</span>} />
      {!won ? (
        <div className="grid grid-cols-2 gap-3">
          <div><p className="mb-1 text-center text-[11px] font-black uppercase text-stone-400">Original</p><Grid arr={BASE} /></div>
          <div><p className="mb-1 text-center text-[11px] font-black uppercase text-stone-400">Amb canvis 👆</p><Grid arr={RIGHT} clickable /></div>
        </div>
      ) : (
        <WinBanner title="Ull de linx! 🔍" subtitle={`3 diferències en ${formatTime(secs)} amb ${fails} errors.`} score={formatTime(secs)} onRestart={() => { setFound([]); setFails(0); setWon(false); }} />
      )}
    </div>
  );
}

/* SEQÜÈNCIA LÒGICA */
const SEQ_PUZZLES = [
  { seq: ["2", "4", "8", "16", "?"], answer: "32", opts: ["20", "24", "32", "30"], tip: "Es multiplica ×2" },
  { seq: ["1", "1", "2", "3", "5", "?"], answer: "8", opts: ["6", "7", "8", "9"], tip: "Fibonacci: suma els dos anteriors" },
  { seq: ["5", "10", "20", "40", "?"], answer: "80", opts: ["60", "80", "50", "100"], tip: "El doble cada cop" },
  { seq: ["3", "6", "11", "18", "?"], answer: "27", opts: ["25", "26", "27", "29"], tip: "+3, +5, +7, +9…" },
  { seq: ["1", "4", "9", "16", "?"], answer: "25", opts: ["20", "24", "25", "36"], tip: "Quadrats perfectes" },
];
export function GameSequence({ onComplete }: GameProps) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feed, setFeed] = useState<null | string>(null);
  const [done, setDone] = useState(false);
  const p = SEQ_PUZZLES[idx];

  const pick = (o: string) => {
    if (feed || done) return;
    const ok = o === p.answer; setFeed(o); if (ok) setScore((s) => s + 1);
    setTimeout(() => { setFeed(null); if (idx + 1 >= SEQ_PUZZLES.length) { setDone(true); onComplete((score + (ok ? 1 : 0)) * 100, `${score + (ok ? 1 : 0)}/5`); } else setIdx(idx + 1); }, 900);
  };

  return (
    <div>
      <GameHeader instruction="Completa la seqüència lògica. Pensa el patró." extra={<span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-800">{idx + 1}/5 · ⭐{score}</span>} />
      {!done ? (
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-2">{p.seq.map((s, i) => (<span key={i} className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black ${s === "?" ? "bg-amber-400 text-white ring-2 ring-amber-600" : "bg-white ring-1 ring-stone-200"}`}>{s}</span>))}</div>
          <div className="mx-auto mt-4 grid max-w-[320px] grid-cols-2 gap-2">
            {p.opts.map((o) => (<button key={o} onClick={() => pick(o)} className={`rounded-xl py-3 text-xl font-black ring-1 transition-all active:scale-95 ${feed === o ? (o === p.answer ? "bg-emerald-500 text-white" : "animate-shake bg-red-500 text-white") : feed && o === p.answer ? "bg-emerald-100 ring-emerald-400" : "bg-white ring-stone-200 hover:bg-teal-50"}`}>{o}</button>))}
          </div>
          {feed && <p className="mt-2 text-xs font-bold text-stone-500">💡 {p.tip}</p>}
        </div>
      ) : (
        <WinBanner title={score >= 4 ? "Lògica impecable! 🧩" : "Bon raonament!"} subtitle={`${score} de 5 seqüències correctes.`} score={`${score}/5`} onRestart={() => { setIdx(0); setScore(0); setDone(false); }} />
      )}
    </div>
  );
}

/* ATRAPA OBJECTES */
export function GameCatch({ onComplete, config }: GameProps) {
  const GOOD = safeEmoji(config?.good || "⭐", "⭐"), BAD = safeEmoji(config?.bad || "💣", "💣"), BASKET = safeEmoji(config?.basket || "🧺", "🧺");
  const [basket, setBasket] = useState(50);
  const [items, setItems] = useState<{ id: number; x: number; y: number; type: "star" | "bomb" }[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [phase, setPhase] = useState<"idle" | "play" | "done">("idle");
  const idRef = useRef(0);

  useEffect(() => {
    if (phase !== "play") return;
    if (time <= 0) { setPhase("done"); onComplete(score * 60, `${score} ${GOOD}`); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000); return () => clearTimeout(t);
  }, [time, phase]);

  useEffect(() => {
    if (phase !== "play") return;
    const spawn = setInterval(() => { idRef.current += 1; const nid = idRef.current; setItems((prev) => [...prev.slice(-12), { id: nid, x: 5 + Math.random() * 90, y: 0, type: Math.random() < 0.7 ? "star" : "bomb" }]); }, 750);
    const fall = setInterval(() => {
      setItems((prev) => {
        const next = prev.map((it) => ({ ...it, y: it.y + 7 + Math.random() * 4 })).filter((it) => it.y < 105);
        const caught = next.filter((it) => it.y >= 82 && it.y <= 98 && Math.abs(it.x - basket) < 12);
        if (caught.length) { let d = 0; caught.forEach((c) => { d += c.type === "star" ? 1 : -2; }); setScore((s) => Math.max(0, s + d)); return next.filter((it) => !caught.includes(it)); }
        return next;
      });
    }, 120);
    return () => { clearInterval(spawn); clearInterval(fall); };
  }, [phase, basket]);

  const start = () => { setScore(0); setTime(30); setItems([]); setPhase("play"); };

  return (
    <div>
      <GameHeader instruction={`Mou ${BASKET} amb ⬅️➡️ i atrapa ${GOOD}. Esquiva ${BAD} (-2)!`} extra={<span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-800">{GOOD} {score} · ⏱ {time}s</span>} />
      {phase === "idle" && (<div className="rounded-2xl bg-yellow-50 p-8 text-center ring-1 ring-yellow-200"><div className="text-5xl">{BASKET}</div><p className="mt-2 text-sm font-bold text-yellow-900">Objectiu: 8 {GOOD} en 30s</p><button onClick={start} className="mt-4 rounded-xl bg-yellow-500 px-6 py-2.5 font-black text-white hover:bg-yellow-600">A atrapar!</button></div>)}
      {phase === "play" && (
        <>
          <div className="relative h-[300px] overflow-hidden rounded-2xl bg-sky-100 ring-1 ring-sky-200">
            {items.map((it) => (<span key={it.id} style={{ left: `${it.x}%`, top: `${it.y}%` }} className="absolute -translate-x-1/2 text-2xl">{it.type === "star" ? GOOD : BAD}</span>))}
            <span style={{ left: `${basket}%` }} className="absolute bottom-2 -translate-x-1/2 text-4xl">{BASKET}</span>
          </div>
          <div className="mx-auto mt-3 flex max-w-[280px] gap-2">
            <button onClick={() => setBasket((b) => Math.max(5, b - 12))} className="flex-1 rounded-xl bg-stone-900 py-3 text-xl font-black text-white active:scale-95">⬅️</button>
            <button onClick={() => setBasket((b) => Math.min(95, b + 12))} className="flex-1 rounded-xl bg-stone-900 py-3 text-xl font-black text-white active:scale-95">➡️</button>
          </div>
        </>
      )}
      {phase === "done" && (<WinBanner title={score >= 8 ? `Col·lecció completa! ${GOOD}` : "Bon esforç!"} subtitle={`${score} ${GOOD} atrapats.`} score={`${score} ${GOOD}`} onRestart={start} />)}
    </div>
  );
}

/* TRIVIAL */
const TRIVIA = [
  { q: "Quin és el planeta vermell?", opts: ["Venus", "Mart", "Júpiter", "Saturn"], a: "Mart" },
  { q: "Quants continents hi ha?", opts: ["5", "6", "7", "8"], a: "7" },
  { q: "Quin animal fa 'mèu'?", opts: ["Gos", "Gat", "Ànec", "Vaca"], a: "Gat" },
  { q: "2 + 2 × 2 = ?", opts: ["6", "8", "4", "10"], a: "6" },
  { q: "Capital de França?", opts: ["Roma", "Madrid", "París", "Londres"], a: "París" },
];
export function GameTrivia({ onComplete, config }: GameProps) {
  const [QS] = useState(() => {
    const lines = String(config?.questions || "").split("\n").map((l) => l.trim()).filter(Boolean);
    const parsed = lines.map((l) => { const parts = l.split("|").map((p) => p.trim()); if (parts.length < 4) return null; const a = parts[parts.length - 1]; const opts = parts.slice(1, parts.length - 1); return { q: parts[0], opts, a: opts.includes(a) ? a : opts[0] }; }).filter(Boolean) as typeof TRIVIA;
    return parsed.length >= 2 ? parsed : TRIVIA;
  });
  const [shuffledOpts, setShuffledOpts] = useState<string[]>(() => shuffle(QS[0].opts));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const q = QS[idx]; const TOTAL = QS.length;

  const answer = (o: string) => {
    if (pick || done) return;
    setPick(o); const ok = o === q.a; if (ok) setScore((s) => s + 1);
    setTimeout(() => { setPick(null); if (idx + 1 >= TOTAL) { setDone(true); onComplete((score + (ok ? 1 : 0)) * 100, `${score + (ok ? 1 : 0)}/${TOTAL}`); } else { setIdx(idx + 1); setShuffledOpts(shuffle(QS[idx + 1].opts)); } }, 800);
  };

  return (
    <div>
      <GameHeader instruction={`${TOTAL} preguntes. Demostra quant en saps!`} extra={<span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">{idx + 1}/{TOTAL} · ⭐{score}</span>} />
      {!done ? (
        <div>
          <h3 className="rounded-2xl bg-stone-900 p-4 text-center text-lg font-black text-white">{q.q}</h3>
          <div className="mt-3 grid gap-2">
            {shuffledOpts.map((o) => (<button key={o} onClick={() => answer(o)} className={`rounded-xl px-4 py-3 text-left font-bold ring-1 transition-all active:scale-[0.98] ${pick === o ? (o === q.a ? "bg-emerald-500 text-white" : "animate-shake bg-red-500 text-white") : pick && o === q.a ? "bg-emerald-100 ring-emerald-400" : "bg-white ring-stone-200 hover:bg-blue-50"}`}>{o}</button>))}
          </div>
        </div>
      ) : (
        <WinBanner title={score >= TOTAL - 1 ? "Em coneixes de debò! 🎓" : "Bon intent!"} subtitle={`${score} de ${TOTAL} encerts.`} score={`${score}/${TOTAL}`} onRestart={() => { setIdx(0); setScore(0); setDone(false); setShuffledOpts(shuffle(QS[0].opts)); }} />
      )}
    </div>
  );
}

/* ANAGRAMES */
const ANAS = [
  { word: "ORDINADOR", hint: "💻 El fas servir per treballar" },
  { word: "BICICLETA", hint: "🚲 Dues rodes i pedals" },
  { word: "ELEFANT", hint: "🐘 L'animal més gran de la sabana" },
];
export function GameAnagram({ onComplete, config }: GameProps) {
  const [LIST] = useState(() => {
    const lines = String(config?.words || "").split("\n").map((l) => l.trim()).filter(Boolean);
    const parsed = lines.map((l) => { const [w, h] = l.split(":"); const word = (w || "").toUpperCase().replace(/[^A-ZÇÑ]/g, ""); return word.length >= 3 ? { word, hint: (h || "").trim() || "Sense pista" } : null; }).filter(Boolean) as typeof ANAS;
    return parsed.length ? parsed.slice(0, 5) : ANAS;
  });
  const [idx, setIdx] = useState(0);
  const [scrambled] = useState<string[][]>(() => LIST.map((a) => {
    // Barreja garantida: re-barreja fins que la paraula no surti ja ordenada
    const letters = a.word.split("");
    let s = shuffle(letters);
    let guard = 0;
    while (s.join("") === letters.join("") && guard++ < 60) s = shuffle(letters);
    if (s.join("") === letters.join("")) s = [...letters].reverse();
    return s;
  }));
  const [built, setBuilt] = useState<string[]>([]);
  const [used, setUsed] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(false);
  const cur = LIST[idx];

  const tap = (letter: string, i: number) => { if (used.includes(i)) return; setUsed([...used, i]); setBuilt([...built, letter]); };
  const clear = () => { setBuilt([]); setUsed([]); };
  const check = () => {
    if (built.join("") === cur.word) { const ns = score + 1; setScore(ns); if (idx + 1 >= LIST.length) { setDone(true); onComplete(ns * 200, `${ns}/${LIST.length}`); } else { setIdx(idx + 1); clear(); } }
    else { setErr(true); setTimeout(() => { setErr(false); clear(); }, 600); }
  };

  return (
    <div>
      <GameHeader instruction="Ordena les lletres per formar la paraula secreta. Fes servir la pista." extra={<span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-black text-fuchsia-800">{idx + 1}/{LIST.length} · ⭐{score}</span>} />
      {!done ? (
        <div className="text-center">
          <p className="rounded-xl bg-fuchsia-50 px-3 py-2 text-sm font-bold text-fuchsia-900 ring-1 ring-fuchsia-200">{cur.hint} · {cur.word.length} lletres</p>
          <div className={`mt-3 flex min-h-[56px] flex-wrap justify-center gap-1.5 rounded-2xl p-3 ring-1 ${err ? "animate-shake bg-red-50 ring-red-300" : "bg-stone-100 ring-stone-200"}`}>
            {built.length === 0 && <span className="self-center text-sm font-bold text-stone-400">Toca les lletres…</span>}
            {built.map((l, i) => (<span key={i} className="flex h-11 w-9 items-center justify-center rounded-lg bg-stone-900 text-lg font-black text-white">{l}</span>))}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {scrambled[idx].map((l, i) => (<button key={i} onClick={() => tap(l, i)} disabled={used.includes(i)} className={`flex h-11 w-9 items-center justify-center rounded-lg text-lg font-black ring-1 transition-all active:scale-95 ${used.includes(i) ? "bg-stone-100 text-transparent ring-stone-200" : "bg-white ring-stone-300 hover:bg-fuchsia-50"}`}>{l}</button>))}
          </div>
          <div className="mt-3 flex justify-center gap-2">
            <button onClick={clear} className="rounded-xl bg-stone-200 px-4 py-2 text-sm font-bold">Esborra</button>
            <button onClick={check} disabled={built.length !== cur.word.length} className="rounded-xl bg-fuchsia-600 px-6 py-2 text-sm font-black text-white disabled:opacity-40">Comprova</button>
          </div>
        </div>
      ) : (
        <WinBanner title="El nostre codi desxifrat! 🔤" subtitle={`${score} de ${LIST.length} paraules.`} score={`${score}/${LIST.length}`} onRestart={() => { setIdx(0); setScore(0); setDone(false); clear(); }} />
      )}
    </div>
  );
}

/* PEDRA PAPER TISORA */
export function GameRPS({ onComplete }: GameProps) {
  const [ps, setPs] = useState(0);
  const [cs, setCs] = useState(0);
  const [round, setRound] = useState(1);
  const [last, setLast] = useState<{ p: string; c: string; r: string } | null>(null);
  const [done, setDone] = useState(false);
  const OPTS = [{ k: "pedra", e: "🪨" }, { k: "paper", e: "📄" }, { k: "tisora", e: "✂️" }];
  const play = (p: string) => {
    if (done) return;
    const c = OPTS[Math.floor(Math.random() * 3)].k;
    let r = "empat";
    if ((p === "pedra" && c === "tisora") || (p === "paper" && c === "pedra") || (p === "tisora" && c === "paper")) r = "guanyes"; else if (p !== c) r = "perds";
    const nps = ps + (r === "guanyes" ? 1 : 0), ncs = cs + (r === "perds" ? 1 : 0);
    setPs(nps); setCs(ncs); setLast({ p, c, r });
    if (nps >= 3 || ncs >= 3 || round >= 5) { setDone(true); if (nps > ncs) onComplete(500, `${nps}-${ncs}`); else if (nps === ncs) onComplete(250, "empat"); } else setRound(round + 1);
  };
  const emo = (k: string) => OPTS.find((o) => o.k === k)?.e;
  const reset = () => { setPs(0); setCs(0); setRound(1); setLast(null); setDone(false); };

  return (
    <div>
      <GameHeader instruction="El millor de 5 contra la màquina. Primera a guanyar 3!" extra={<span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-black text-white">Tu {ps} · {cs} CPU</span>} />
      {!done ? (
        <div className="text-center">
          <p className="text-xs font-black uppercase text-stone-400">Ronda {round}/5</p>
          <div className="mx-auto mt-2 flex max-w-[280px] justify-center gap-3">
            {OPTS.map((o) => (<button key={o.k} onClick={() => play(o.k)} className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-stone-200 transition-all hover:bg-amber-50 active:scale-95"><span>{o.e}</span><span className="mt-1 text-[10px] font-black uppercase">{o.k}</span></button>))}
          </div>
          {last && (
            <div className="animate-pop-in mx-auto mt-3 flex max-w-[280px] items-center justify-center gap-4 rounded-2xl bg-stone-100 p-3 ring-1 ring-stone-200">
              <span className="text-3xl">{emo(last.p)}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${last.r === "guanyes" ? "bg-emerald-500 text-white" : last.r === "perds" ? "bg-red-500 text-white" : "bg-stone-300"}`}>{last.r === "guanyes" ? "GUANYES!" : last.r === "perds" ? "Perds" : "Empat"}</span>
              <span className="text-3xl">{emo(last.c)}</span>
            </div>
          )}
        </div>
      ) : (
        <WinBanner title={ps > cs ? "Victòria èpica! 🏆" : ps === cs ? "Empat!" : "Ha guanyat la màquina! 🤖"} subtitle={`Resultat ${ps} - ${cs}.`} score={`${ps}-${cs}`} onRestart={reset} />
      )}
    </div>
  );
}

/* TRES EN RATLLA */
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
function cpuMove(b: string[]): number {
  const empty = b.map((v, i) => (v === "" ? i : -1)).filter((i) => i >= 0);
  for (const [a, c, d] of LINES) { const L = [b[a], b[c], b[d]]; if (L.filter((x) => x === "O").length === 2 && L.includes("")) return [a, c, d][L.indexOf("")]; }
  for (const [a, c, d] of LINES) { const L = [b[a], b[c], b[d]]; if (L.filter((x) => x === "X").length === 2 && L.includes("")) return [a, c, d][L.indexOf("")]; }
  if (b[4] === "") return 4;
  return empty[Math.floor(Math.random() * empty.length)];
}
function winner(b: string[]): string | null {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return b.includes("") ? null : "E";
}
export function GameTicTac({ onComplete }: GameProps) {
  const [b, setB] = useState<string[]>(Array(9).fill(""));
  const [w, setW] = useState<string | null>(null);
  const play = (i: number) => {
    if (b[i] || w) return;
    let nb = [...b]; nb[i] = "X";
    let win = winner(nb);
    if (win) { setB(nb); setW(win); if (win === "X") onComplete(500, "victòria"); return; }
    const c = cpuMove(nb); nb[c] = "O"; win = winner(nb); setB(nb); setW(win);
    if (win === "X") onComplete(500, "victòria");
  };
  const cell = (v: string) => (v === "X" ? "✕" : v === "O" ? "◯" : "");
  return (
    <div>
      <GameHeader instruction="Ets ❌ contra la màquina ⭕. Fes 3 en ratlla!" />
      <div className={`mx-auto grid max-w-[280px] grid-cols-3 gap-2 ${w ? "opacity-60" : ""}`}>
        {b.map((v, i) => (<button key={i} onClick={() => play(i)} className={`flex aspect-square items-center justify-center rounded-2xl text-4xl font-black transition-all active:scale-95 ${v === "X" ? "bg-indigo-600 text-white" : v === "O" ? "bg-white text-red-500 ring-2 ring-red-200" : "bg-white ring-1 ring-stone-200 hover:bg-indigo-50"}`}>{cell(v)}</button>))}
      </div>
      {w && <div className="mt-3"><WinBanner title={w === "X" ? "Has guanyat! 🎉" : w === "E" ? "Empat!" : "Ha guanyat la màquina!"} subtitle={w === "X" ? "Tres en ratlla perfecte." : w === "E" ? "Ningú es rendeix." : "Torna-ho a intentar."} onRestart={() => { setB(Array(9).fill("")); setW(null); }} /></div>}
    </div>
  );
}

/* REFLEX VERD */
export function GameReflex({ onComplete }: GameProps) {
  const [phase, setPhase] = useState<"idle" | "wait" | "go" | "early" | "res">("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [t0, setT0] = useState(0);
  const [lastMs, setLastMs] = useState(0);
  const to = useRef<any>(null);

  const startRound = () => { setPhase("wait"); clearTimeout(to.current); to.current = setTimeout(() => { setPhase("go"); setT0(Date.now()); }, 1500 + Math.random() * 2500); };
  const tap = () => {
    if (phase === "wait") { clearTimeout(to.current); setPhase("early"); }
    else if (phase === "go") {
      const ms = Date.now() - t0; setLastMs(ms); const nt = [...times, ms]; setTimes(nt); setPhase("res");
      if (nt.length >= 3) { const avg = Math.round(nt.reduce((a, b) => a + b, 0) / 3); onComplete(Math.max(0, 1000 - avg), `${avg}ms`); }
    }
  };
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div>
      <GameHeader instruction="Espera el VERD i prem rapidíssim. 3 rondes. No t'avancis!" extra={<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Ronda {Math.min(times.length + 1, 3)}/3</span>} />
      {phase === "idle" && (<div className="rounded-2xl bg-stone-100 p-8 text-center"><div className="text-5xl">🚦</div><button onClick={startRound} className="mt-4 rounded-xl bg-stone-900 px-6 py-2.5 font-black text-white">Comença el test</button></div>)}
      {(phase === "wait" || phase === "go") && (
        <button onClick={tap} className={`flex h-[240px] w-full flex-col items-center justify-center rounded-2xl text-center font-black text-white transition-colors ${phase === "wait" ? "bg-red-500" : "animate-pulse bg-emerald-500"}`}>
          <span className="text-4xl">{phase === "wait" ? "🔴 ESPERA…" : "🟢 ARA!"}</span>
          <span className="mt-2 text-sm font-bold opacity-80">{phase === "wait" ? "No premis encara" : "Prem ara!"}</span>
        </button>
      )}
      {phase === "early" && (<div className="rounded-2xl bg-red-50 p-6 text-center ring-1 ring-red-200"><p className="text-2xl font-black text-red-700">⚠️ Massa aviat!</p><button onClick={startRound} className="mt-3 rounded-xl bg-red-600 px-5 py-2 font-bold text-white">Repeteix la ronda</button></div>)}
      {phase === "res" && (
        <div className="rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-200">
          <p className="text-5xl font-black tabular-nums text-emerald-800">{lastMs}<span className="text-xl">ms</span></p>
          <p className="mt-1 text-sm font-bold text-emerald-700">{lastMs < 250 ? "Reflexos de pilot! 🏎️" : lastMs < 400 ? "Molt bé!" : "Pots millorar…"}</p>
          {times.length < 3 ? (<button onClick={startRound} className="mt-4 rounded-xl bg-emerald-600 px-6 py-2.5 font-black text-white">Següent ronda →</button>) : (<div className="mt-4"><WinBanner title={`Mitjana: ${avg}ms ⚡`} subtitle={avg < 300 ? "Reflexos d'elit!" : "Test completat."} score={`${avg}ms`} onRestart={() => { setTimes([]); setPhase("idle"); }} /></div>)}
        </div>
      )}
    </div>
  );
}
