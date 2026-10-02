import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { APP_NAME, DEFAULT_MEMORIES, EMOTIONS, EmotionKey, FINAL_DEFAULT, Memory } from "./data/memories";
import {
  loadMemories, saveMemories, loadFinal, saveFinal, loadProgress, saveProgress, resetProgress,
  loadPublished, applyMemoryOverrides, loadLocalMemoryOverrides, loadLocalFinalOverride, clearLocalContent, Progress,
} from "./data/store";
import { Sphere } from "./components/Sphere";
import { MemoryExperience } from "./components/MemoryExperience";
import { Editor } from "./components/Editor";
import { PrintSheets } from "./components/PrintSheets";

const pad = (n: number) => String(n).padStart(2, "0");

function Fons() {
  return (
    <div className="fondo-bolas">
      <span className="bola b1" /><span className="bola b2" /><span className="bola b3" /><span className="bola b4" /><span className="bola b5" />
    </div>
  );
}

export default function App() {
  const [memories, setMemories] = useState<Memory[]>(() => loadMemories());
  const [final, setFinal] = useState<typeof FINAL_DEFAULT>(() => loadFinal());
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const unlockedCount = Object.keys(progress).length;
  const allDone = unlockedCount >= 30;

  useEffect(() => saveProgress(progress), [progress]);

  const updateMemories = (list: Memory[]) => { setMemories(list); saveMemories(list); };
  const updateFinal = (f: typeof FINAL_DEFAULT) => { setFinal(f); saveFinal(f); };

  // Paràmetres de la URL: ?bola=N  ?editar=1  ?reset=1  ?neteja=1
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("neteja") === "1") {
      clearLocalContent();
      resetProgress();
      setProgress({});
      window.history.replaceState({}, "", window.location.pathname);
      window.location.reload();
      return;
    }
    if (p.get("reset") === "1") {
      resetProgress();
      setProgress({});
      window.history.replaceState({}, "", window.location.pathname);
      setToast("🔄 Progrés reiniciat. Totes les esferes tornen a estar encriptades.");
      setTimeout(() => setToast(null), 4000);
      return;
    }
    const b = parseInt(p.get("bola") || "");
    if (b >= 1 && b <= 30) setActiveId(b);
    if (p.get("editar") === "1") setEditing(true);
  }, []);

  // Contingut publicat (public/recuerdos.json)
  useEffect(() => {
    loadPublished().then((pub) => {
      if (!pub) return;
      const base = applyMemoryOverrides(DEFAULT_MEMORIES, pub.memories);
      setMemories(applyMemoryOverrides(base, loadLocalMemoryOverrides()));
      setFinal({ ...FINAL_DEFAULT, ...pub.final, ...loadLocalFinalOverride() });
    });
  }, []);

  useEffect(() => {
    if (allDone && activeId === null) confetti({ particleCount: 220, spread: 120, origin: { y: 0.4 }, colors: Object.values(EMOTIONS).map((e) => e.color) });
  }, [allDone, activeId]);

  const active = memories.find((m) => m.id === activeId) || null;

  const goHome = () => {
    setActiveId(null);
    window.history.replaceState({}, "", window.location.pathname);
    window.scrollTo({ top: 0 });
  };
  const openSphere = (id: number) => {
    setActiveId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("bola", String(id));
    window.history.replaceState({}, "", url.toString());
    window.scrollTo({ top: 0 });
  };
  const unlock = (id: number, label?: string) => setProgress((prev) => (prev[id] ? prev : { ...prev, [id]: { label: label || "", date: new Date().toLocaleString() } }));

  const byEmotion = useMemo(() => {
    const r = {} as Record<EmotionKey, number>;
    (Object.keys(EMOTIONS) as EmotionKey[]).forEach((k) => (r[k] = 0));
    memories.forEach((m) => { if (progress[m.id]) r[m.emotion]++; });
    return r;
  }, [memories, progress]);

  /* ---------- PÀGINA D'UNA ESFERA ---------- */
  if (active && !editing) {
    const others = Object.keys(progress).filter((k) => Number(k) !== active.id).length;
    return (
      <div className="flex min-h-screen items-center justify-center p-5">
        <Fons />
        <MemoryExperience memory={active} unlocked={!!progress[active.id]} unlockedCount={unlockedCount} othersUnlocked={others} onUnlock={(l) => unlock(active.id, l)} onHome={goHome} />
        {printing && <PrintSheets memories={memories} onClose={() => setPrinting(false)} />}
      </div>
    );
  }

  /* ---------- PÀGINA D'INICI ---------- */
  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <Fons />
      <main className="tarjeta">
        <div className="icono">🔮</div>
        <h1 className="titol">{APP_NAME}</h1>
        <p className="subtitulo">{unlockedCount === 0 ? "Encara no has desxifrat cap esfera" : allDone ? "Has recuperat tots els records!" : `${unlockedCount} de 30 records recuperats`}</p>

        {/* barra de progrés per emocions */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-stone-100 ring-1 ring-stone-200">
          {(Object.keys(EMOTIONS) as EmotionKey[]).map((k) => (<div key={k} className="h-full transition-all duration-700" style={{ width: `${(byEmotion[k] / 30) * 100}%`, background: EMOTIONS[k].color }} />))}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {(Object.keys(EMOTIONS) as EmotionKey[]).map((k) => (<span key={k} className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-500"><span className="h-2 w-2 rounded-full" style={{ background: EMOTIONS[k].color }} />{EMOTIONS[k].name} {byEmotion[k]}</span>))}
        </div>

        {allDone ? (
          <section className="pista mt-5" style={{ borderLeftColor: "#b983ff" }}>
            <b>🌟 {final.title}</b>{"\n\n"}{final.message}
          </section>
        ) : (
          <section className="pista mt-5">
            {unlockedCount <= 1
              ? "Un Minion trapella ha encriptat els teus records.\n\nAcosta el mòbil a cada esfera per desxifrar-la."
              : "Continua acostant el mòbil a les esferes que encara estan encriptades."}
          </section>
        )}
        {allDone && final.photo && <img src={final.photo} alt="" className="foto-record mt-4" />}

        {/* graella d'esferes */}
        <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {memories.map((m) => {
            const done = !!progress[m.id];
            const special = m.kind !== "game";
            return (
              <button
                key={m.id}
                onClick={() => {
                  if (done) openSphere(m.id);
                  else { setToast(`🔒 Esfera ${pad(m.id)} encriptada. Acosta el mòbil a la bola per desxifrar-la.`); setTimeout(() => setToast(null), 2500); }
                }}
                className="flex flex-col items-center gap-1 rounded-xl p-1 transition-all active:scale-95"
                title={done ? m.title : "Encriptada"}
              >
                <Sphere emotion={m.emotion} emotion2={m.emotion2} size={56} locked={!done} photo={done ? m.photo : undefined} number={m.id} />
                <span className={`text-[9px] font-bold leading-tight ${done ? "text-stone-700" : "text-stone-400"}`}>{done ? (special ? (m.kind === "intro" ? "Inici" : m.kind === "gift" ? "🎁" : "🎬") : "✓") : special && m.kind !== "intro" ? "★" : "?"}</span>
              </button>
            );
          })}
        </div>

        <div className="final">{allDone ? "💛 Gràcies per recuperar-los tots." : "🔍 Busca la següent esfera."}</div>
        <p className="mt-4 text-[11px] font-semibold text-stone-400">Les esferes grises encara estan encriptades. Les daurades ★ són especials.</p>
      </main>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-2xl bg-stone-900 px-4 py-3 text-center text-sm font-bold text-white shadow-xl animate-pop-in">{toast}</div>
      )}

      {editing && (
        <Editor
          memories={memories}
          final={final}
          progress={progress}
          onChange={updateMemories}
          onChangeFinal={updateFinal}
          onResetProgress={() => { resetProgress(); setProgress({}); }}
          onUnlockAll={() => { const p: Progress = {}; memories.forEach((m) => (p[m.id] = { label: "prova", date: new Date().toLocaleString() })); setProgress(p); }}
          onClose={() => { setEditing(false); window.history.replaceState({}, "", window.location.pathname); }}
          onPrint={() => setPrinting(true)}
        />
      )}
      {printing && <PrintSheets memories={memories} onClose={() => setPrinting(false)} />}
    </div>
  );
}
