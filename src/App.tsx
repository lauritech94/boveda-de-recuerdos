import { useEffect, useMemo, useState } from "react";
import { Settings2, Sparkles, Smartphone, Lock, Unlock, RotateCcw, Star, X, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { DEFAULT_MEMORIES, EMOTIONS, EmotionKey, FINAL_DEFAULT, Memory } from "./data/memories";
import {
  loadMemories, saveMemories, loadFinal, saveFinal, loadProgress, saveProgress, resetProgress,
  loadPublished, applyMemoryOverrides, loadLocalMemoryOverrides, loadLocalFinalOverride, Progress,
} from "./data/store";
import { Sphere } from "./components/Sphere";
import { MemoryExperience } from "./components/MemoryExperience";
import { Editor } from "./components/Editor";
import { PrintSheets } from "./components/PrintSheets";

export default function App() {
  const [memories, setMemories] = useState<Memory[]>(() => loadMemories());
  const [final, setFinal] = useState<typeof FINAL_DEFAULT>(() => loadFinal());
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [filter, setFilter] = useState<EmotionKey | "all">("all");
  const [nfcHint, setNfcHint] = useState(false);

  const unlockedCount = Object.keys(progress).length;
  const allDone = unlockedCount >= 30;

  useEffect(() => saveProgress(progress), [progress]);

  // Cambios hechos en el panel de edición: se guardan en este navegador
  const updateMemories = (list: Memory[]) => { setMemories(list); saveMemories(list); };
  const updateFinal = (f: typeof FINAL_DEFAULT) => { setFinal(f); saveFinal(f); };

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const b = parseInt(p.get("bola") || "");
    if (b >= 1 && b <= 30) setActiveId(b);
    if (p.get("editar") === "1") setEditing(true);
  }, []);

  // Contenido publicado (public/recuerdos.json). Lo que edites aquí tiene prioridad.
  useEffect(() => {
    loadPublished().then((pub) => {
      if (!pub) return;
      const base = applyMemoryOverrides(DEFAULT_MEMORIES, pub.memories);
      setMemories(applyMemoryOverrides(base, loadLocalMemoryOverrides()));
      setFinal({ ...FINAL_DEFAULT, ...pub.final, ...loadLocalFinalOverride() });
    });
  }, []);

  const active = memories.find((m) => m.id === activeId) || null;

  const open = (id: number) => {
    setActiveId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("bola", String(id));
    window.history.replaceState({}, "", url.toString());
  };
  const close = () => {
    setActiveId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("bola");
    window.history.replaceState({}, "", url.pathname);
    if (allDone) setTimeout(() => setShowFinal(true), 300);
  };
  const unlock = (id: number, label?: string) => {
    setProgress((prev) => (prev[id] ? prev : { ...prev, [id]: { label: label || "", date: new Date().toLocaleString() } }));
  };

  useEffect(() => {
    if (allDone && !activeId) {
      setShowFinal(true);
      confetti({ particleCount: 250, spread: 120, origin: { y: 0.4 }, colors: Object.values(EMOTIONS).map((e) => e.color) });
    }
  }, [allDone]);

  const byEmotion = useMemo(() => {
    const r: Record<EmotionKey, { total: number; done: number }> = { alegria: { total: 0, done: 0 }, tristeza: { total: 0, done: 0 }, ira: { total: 0, done: 0 }, asco: { total: 0, done: 0 }, miedo: { total: 0, done: 0 } };
    memories.forEach((m) => { r[m.emotion].total++; if (progress[m.id]) r[m.emotion].done++; });
    return r;
  }, [memories, progress]);

  const visible = filter === "all" ? memories : memories.filter((m) => m.emotion === filter || m.emotion2 === filter);
  const nextLocked = memories.find((m) => !progress[m.id]);

  return (
    <div className="vault-bg min-h-screen text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0a1f]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Sphere emotion="alegria" emotion2="tristeza" size={38} />
            <div className="leading-tight">
              <p className="text-base font-black tracking-tight">La Bóveda de Recuerdos</p>
              <p className="text-[11px] font-bold text-white/50">30 esferas · nuestra historia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 sm:flex">
              <Star className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-black tabular-nums">{unlockedCount}/30</span>
            </div>
            <button onClick={() => setEditing(true)} title="Panel de edición" className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20">
              <Settings2 className="h-4 w-4" /> <span className="hidden sm:inline">Editar fichas</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-10 h-56 w-56 rounded-full blur-3xl" style={{ background: EMOTIONS.alegria.glow }} />
          <div className="absolute right-[5%] top-24 h-48 w-48 rounded-full blur-3xl" style={{ background: EMOTIONS.tristeza.glow }} />
          <div className="absolute bottom-0 left-[40%] h-40 w-40 rounded-full blur-3xl" style={{ background: EMOTIONS.miedo.glow }} />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-10 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Para mi hermana
          </p>
          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            Cada esfera guarda<br />
            <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-sky-300 bg-clip-text text-transparent">un recuerdo nuestro.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] font-semibold leading-relaxed text-white/65">
            Acerca el móvil a una bola, supera su pequeño reto y el recuerdo se iluminará: una foto, unas palabras, un trozo de nuestra historia. Cuando las 30 brillen, habrá algo más esperándote.
          </p>

          {/* progreso emocional */}
          <div className="mx-auto mt-7 max-w-2xl">
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
              {(Object.keys(EMOTIONS) as EmotionKey[]).map((k) => (
                <div key={k} className="h-full transition-all duration-700" style={{ width: `${(byEmotion[k].done / 30) * 100}%`, background: EMOTIONS[k].color }} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button onClick={() => setFilter("all")} className={`rounded-full px-3 py-1 text-xs font-black ring-1 transition-all ${filter === "all" ? "bg-white text-stone-900 ring-white" : "bg-white/5 text-white/70 ring-white/15 hover:bg-white/10"}`}>Todas · {unlockedCount}/30</button>
              {(Object.keys(EMOTIONS) as EmotionKey[]).map((k) => (
                <button key={k} onClick={() => setFilter(filter === k ? "all" : k)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ring-1 transition-all ${filter === k ? "text-stone-900 ring-white" : "bg-white/5 text-white/80 ring-white/15 hover:bg-white/10"}`} style={filter === k ? { background: EMOTIONS[k].color } : undefined}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: EMOTIONS[k].color }} /> {EMOTIONS[k].name} {byEmotion[k].done}/{byEmotion[k].total}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button onClick={() => setNfcHint(true)} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-stone-900 shadow-lg hover:bg-amber-50">
              <Smartphone className="h-5 w-5" /> Acerca el móvil a una bola
            </button>
            {nextLocked && (
              <button onClick={() => open(nextLocked.id)} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-black ring-1 ring-white/20 hover:bg-white/20">
                <Unlock className="h-5 w-5" /> Probar esfera #{nextLocked.id}
              </button>
            )}
            {allDone && (
              <button onClick={() => setShowFinal(true)} className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-black text-stone-900 shadow-lg" style={{ background: EMOTIONS.alegria.color }}>
                <Star className="h-5 w-5" /> Recuerdo final
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SHELVES */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-black">Estantería de la memoria</h2>
            <p className="text-xs font-semibold text-white/50">Las esferas grises todavía esperan ser descubiertas.</p>
          </div>
          <p className="text-xs font-bold text-white/40">{visible.length} esferas</p>
        </div>

        {Array.from({ length: Math.ceil(visible.length / 6) }).map((_, row) => {
          const items = visible.slice(row * 6, row * 6 + 6);
          return (
            <div key={row} className="relative mb-2">
              <div className="grid grid-cols-3 gap-2 px-2 pb-3 sm:grid-cols-6">
                {items.map((m) => {
                  const done = !!progress[m.id];
                  return (
                    <button key={m.id} onClick={() => open(m.id)} className="group flex flex-col items-center gap-1.5 rounded-2xl p-2 transition-all hover:bg-white/5 active:scale-95">
                      <Sphere emotion={m.emotion} emotion2={m.emotion2} size={82} locked={!done} photo={done ? m.photo : undefined} number={m.id} />
                      <span className={`line-clamp-2 text-center text-[11px] font-black leading-tight ${done ? "text-white" : "text-white/35"}`}>{done ? m.title : "???"}</span>
                      {done ? <span className="text-[10px] font-bold" style={{ color: EMOTIONS[m.emotion].color }}>{EMOTIONS[m.emotion].name}</span> : <span className="text-[10px] font-bold text-white/25">{m.when}</span>}
                    </button>
                  );
                })}
              </div>
              <div className="shelf h-3 rounded-full" />
            </div>
          );
        })}

        {/* reset */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-sm font-black">Progreso guardado en este móvil</p>
            <p className="text-xs font-semibold text-white/50">{unlockedCount} de 30 recuerdos desbloqueados</p>
          </div>
          <button onClick={() => { if (confirm("¿Bloquear de nuevo todas las esferas? (solo el progreso, no los textos)")) { resetProgress(); setProgress({}); setShowFinal(false); } }} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-black hover:bg-red-500/30">
            <RotateCcw className="h-4 w-4" /> Reiniciar progreso
          </button>
        </div>
      </section>

      <footer className="border-t border-white/10 py-6 text-center text-xs font-semibold text-white/40">
        Hecho con <Heart className="inline h-3 w-3 text-rose-400" /> · Inspirado en las esferas de recuerdos de Inside Out
      </footer>

      {/* NFC HINT */}
      {nfcHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setNfcHint(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center text-stone-900" onClick={(e) => e.stopPropagation()}>
            <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-sky-300/40" />
              <div className="absolute inset-4 animate-pulse rounded-full bg-sky-300/40" />
              <Sphere emotion="tristeza" emotion2="alegria" size={110} pulse />
              <span className="absolute -bottom-1 -right-1 text-4xl">📱</span>
            </div>
            <h3 className="mt-4 text-xl font-black">Acerca el móvil a la bola</h3>
            <p className="mt-1 text-sm font-semibold text-stone-500">Cada esfera tiene una etiqueta NFC dentro. Al acercar el teléfono (con NFC activado) se abrirá automáticamente su recuerdo.</p>
            <p className="mt-3 rounded-xl bg-stone-100 px-3 py-2 text-xs font-bold text-stone-600">iPhone: parte superior trasera · Android: centro de la espalda del móvil</p>
            <button onClick={() => setNfcHint(false)} className="mt-4 w-full rounded-2xl bg-stone-900 py-3 font-black text-white">Entendido</button>
          </div>
        </div>
      )}

      {/* EXPERIENCE */}
      {active && (
        <MemoryExperience memory={active} unlocked={!!progress[active.id]} unlockedCount={unlockedCount} onUnlock={(l) => unlock(active.id, l)} onClose={close} />
      )}

      {/* FINAL */}
      {showFinal && allDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07061a]/95 p-4 backdrop-blur" onClick={() => setShowFinal(false)}>
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white text-stone-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative px-6 pb-6 pt-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${EMOTIONS.alegria.color}, ${EMOTIONS.tristeza.color} 60%, ${EMOTIONS.miedo.color})` }}>
              <button onClick={() => setShowFinal(false)} className="absolute right-3 top-3 rounded-full bg-black/25 p-2"><X className="h-4 w-4" /></button>
              <div className="mx-auto flex justify-center gap-1">
                {(Object.keys(EMOTIONS) as EmotionKey[]).map((k, i) => (<div key={k} style={{ marginTop: i % 2 ? 10 : 0 }}><Sphere emotion={k} size={40} /></div>))}
              </div>
              <p className="mt-3 text-[11px] font-black uppercase tracking-widest opacity-80">30 de 30 · Recuerdo central</p>
              <h2 className="mt-1 text-2xl font-black drop-shadow">{final.title}</h2>
            </div>
            <div className="p-5">
              {final.photo ? (
                <img src={final.photo} alt="" className="max-h-72 w-full rounded-2xl object-cover shadow-lg" />
              ) : (
                <div className="flex h-44 flex-col items-center justify-center rounded-2xl bg-amber-50 text-center text-amber-800 ring-1 ring-amber-200">
                  <span className="text-4xl">🌟</span>
                  <p className="mt-1 text-sm font-black">Aquí irá la foto del recuerdo final</p>
                  <p className="text-xs font-semibold opacity-70">Panel de edición → Recuerdo final</p>
                </div>
              )}
              <p className="mt-4 whitespace-pre-line text-[15px] font-semibold leading-relaxed text-stone-800">{final.message}</p>
              <button onClick={() => { setShowFinal(false); confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } }); }} className="mt-5 w-full rounded-2xl py-3 font-black text-stone-900" style={{ background: EMOTIONS.alegria.color }}>Te quiero 💛</button>
            </div>
          </div>
        </div>
      )}

      {/* EDITOR */}
      {editing && (
        <Editor memories={memories} final={final} onChange={updateMemories} onChangeFinal={updateFinal} onClose={() => setEditing(false)} onPrint={() => setPrinting(true)} />
      )}
      {printing && <PrintSheets memories={memories} onClose={() => setPrinting(false)} />}

      {/* unlocked badge helper for lock icon import */}
      <span className="hidden"><Lock className="h-0 w-0" /></span>
    </div>
  );
}
