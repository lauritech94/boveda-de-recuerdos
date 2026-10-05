import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { APP_NAME, DEFAULT_MEMORIES, EMOTIONS, EmotionKey, FINAL_DEFAULT, Memory } from "./data/memories";
import {
  loadMemories, saveMemories, loadFinal, saveFinal, loadProgress, saveProgress, resetProgress,
  loadPublished, applyMemoryOverrides, loadLocalMemoryOverrides, loadLocalFinalOverride, clearLocalContent, hasLocalContent, exportAll, mergeFinal, Progress,
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
  const [showProgress, setShowProgress] = useState(false);

  const unlockedCount = Object.keys(progress).length;
  const allDone = unlockedCount >= 30;

  useEffect(() => saveProgress(progress), [progress]);

  const updateMemories = (list: Memory[]) => { setMemories(list); saveMemories(list); };
  const updateFinal = (f: typeof FINAL_DEFAULT) => { setFinal(f); saveFinal(f); };

  // Paràmetres de la URL: ?bola=N  ?editar=1  ?reset=1  ?neteja=1
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("neteja") === "1") {
      const clean = () => {
        window.history.replaceState({}, "", window.location.pathname);
        setTimeout(() => window.location.reload(), 700);
      };
      if (hasLocalContent()) {
        const okGo = window.confirm(
          "⚠️ Aquest navegador té canvis fets amb el panell d'edició (textos, fotos…).\n\n" +
            "Si continues, s'esborraran d'aquí i es descarregarà abans una còpia de seguretat (recuerdos-copia-seguretat.json).\n\n" +
            "Continuar?"
        );
        if (!okGo) {
          window.history.replaceState({}, "", window.location.pathname);
          return;
        }
        exportAll(loadMemories(), loadFinal(), "recuerdos-copia-seguretat.json");
      }
      clearLocalContent();
      resetProgress();
      setProgress({});
      clean();
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
      setFinal(mergeFinal(pub.final, loadLocalFinalOverride()));
    });
  }, []);

  useEffect(() => {
    if (allDone && activeId === null) confetti({ particleCount: 220, spread: 120, origin: { y: 0.4 }, colors: Object.values(EMOTIONS).map((e) => e.color) });
  }, [allDone, activeId]);

  const active = memories.find((m) => m.id === activeId) || null;

  const goHome = () => {
    setActiveId(null);
    setShowProgress(true);
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
        <p className="subtitulo">{allDone ? "Has recuperat tots els records!" : unlockedCount === 0 ? "Missatge urgent" : `${unlockedCount} de 30 records recuperats`}</p>

        {/* Missatge final (només quan ja ha desxifrat les 30) */}
        {allDone && (
          <>
            <section className="pista mb-4" style={{ borderLeftColor: "#b983ff" }}>
              <b>🌟 {final.title}</b>{"\n\n"}{final.message}
            </section>
            {final.photo && <img src={final.photo} alt="" className="foto-record mb-4" />}
          </>
        )}

        {/* EXPLICACIÓ: aquesta és la pantalla principal */}
        <section className="pista">{final.homeText}</section>

        <div className="final">{allDone ? "💛 Gràcies per recuperar-los tots." : "🔍 Busca la primera esfera per a començar l'aventura."}</div>

        {/* Progrés: només apareix quan ja ha desxifrat alguna esfera */}
        {unlockedCount > 0 && (
          <div className="mt-6 border-t border-stone-100 pt-4">
            <button onClick={() => setShowProgress((v) => !v)} className="boto secundari" style={{ marginTop: 0 }}>
              {showProgress ? "Amagar el meu progrés ▲" : `📖 Veure el meu progrés (${unlockedCount}/30) ▼`}
            </button>

            {showProgress && (
              <div className="animate-pop-in mt-4">
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-stone-100 ring-1 ring-stone-200">
                  {(Object.keys(EMOTIONS) as EmotionKey[]).map((k) => (<div key={k} className="h-full transition-all duration-700" style={{ width: `${(byEmotion[k] / 30) * 100}%`, background: EMOTIONS[k].color }} />))}
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
                  {(Object.keys(EMOTIONS) as EmotionKey[]).map((k) => (<span key={k} className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-500"><span className="h-2 w-2 rounded-full" style={{ background: EMOTIONS[k].color }} />{EMOTIONS[k].name} {byEmotion[k]}</span>))}
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6">
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
                <p className="mt-3 text-[11px] font-semibold text-stone-400">Les esferes grises encara estan encriptades. Les ★ són especials.</p>
              </div>
            )}
          </div>
        )}
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
