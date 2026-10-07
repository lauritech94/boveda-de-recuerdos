import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { APP_NAME, DEFAULT_MEMORIES, EMOTIONS, EmotionKey, FINAL_DEFAULT, Memory } from "./data/memories";
import {
  loadMemories, saveMemories, loadFinal, saveFinal, loadProgress, saveProgress, resetProgress,
  loadPublished, applyMemoryOverrides, loadLocalMemoryOverrides, loadLocalFinalOverride, mergeFinal,
  getLocalBaseSig, hasLocalOverrides, clearLocalOverrides, cleanupOldContentKeys, Progress,
} from "./data/store";
import { Sphere } from "./components/Sphere";
import { MemoryExperience } from "./components/MemoryExperience";
import { Editor } from "./components/Editor";
import { PrintSheets } from "./components/PrintSheets";
import { MinionImg } from "./components/MinionImg";
import { Teaser } from "./components/Teaser";
import { useSound, playSound } from "./components/useSound";
import { Volume2, VolumeX, Sparkles } from "lucide-react";

const pad = (n: number) => String(n).padStart(2, "0");

function Fons() {
  return (
    <div className="fondo-bolas">
      <span className="bola b1" />
      <span className="bola b2" />
      <span className="bola b3" />
      <span className="bola b4" />
      <span className="bola b5" />
      <span className="bola b6" />
      <span className="bola b7" />
      <span className="bola b8" />
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
  const [minionComment, setMinionComment] = useState<string | null>(null);
  // No es pinta res fins que les dades publicades estiguin carregades:
  // així no es veu ni un instant el text per defecte abans del vostre.
  const [ready, setReady] = useState(false);
  // Avançament del dia de l'aniversari (?sorpresa=1): pàgina independent del joc
  const [teaserMode] = useState(() => new URLSearchParams(window.location.search).get("sorpresa") === "1");

  const { on: soundActive, toggle: toggleSound } = useSound();

  const unlockedCount = Object.keys(progress).length;
  const allDone = unlockedCount >= 30;

  useEffect(() => saveProgress(progress), [progress]);

  const updateMemories = (list: Memory[]) => { setMemories(list); saveMemories(list); };
  const updateFinal = (f: typeof FINAL_DEFAULT) => { setFinal(f); saveFinal(f); };

  // Frases del Minion cada 5 esferes. Es compara amb el recompte anterior (no amb "===")
  // perquè funcioni encara que es passi d'esfera en esfera sense tornar mai a l'inici,
  // i es mostra com a avís flotant visible des de QUALSEVOL pantalla.
  const MILESTONES: { n: number; msg: string }[] = [
    { n: 5, msg: "🍌 Bello! Ja en portes 5? No m'ho crec!" },
    { n: 10, msg: "🍌 Bello! Ja en portes 10!" },
    { n: 15, msg: "⚡ Ja ets a la meitat dels records!" },
    { n: 20, msg: "🔥 Ja en portes 20! Només en falten 10!" },
    { n: 25, msg: "🔥 Només te'n falten 5, nooo!" },
    { n: 29, msg: "🎬 Només falta l'última! Prepara't!" },
    { n: 30, msg: "🌟 BANANAAA! Els has aconseguit tots!" },
  ];
  const prevCountRef = useRef(unlockedCount);
  useEffect(() => {
    const prev = prevCountRef.current;
    if (unlockedCount > prev) {
      const crossed = MILESTONES.filter((ms) => ms.n > prev && ms.n <= unlockedCount);
      if (crossed.length) {
        const msg = crossed[crossed.length - 1].msg;
        setMinionComment(msg);
        playSound("star");
        setTimeout(() => setMinionComment((c) => (c === msg ? null : c)), 6000);
      }
    }
    prevCountRef.current = unlockedCount;
  }, [unlockedCount]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
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

  useEffect(() => {
    // Neteja de dades locals antigues de versions anteriors (fosa per a cada canvi de codi)
    cleanupOldContentKeys();
    loadPublished()
      .then((pub) => {
        if (!pub) return;
        const base = applyMemoryOverrides(DEFAULT_MEMORIES, pub.memories);
        // Si el recuerdos.json publicat NO és el que servia de base als canvis locals
        // (algú n'ha publicat un de nou, o la còpia local és d'abans d'aquest sistema),
        // la còpia local és obsoleta: s'esborra i es mostra el publicat.
        const localIsStale = hasLocalOverrides() && getLocalBaseSig() !== pub.sig;
        if (localIsStale) {
          clearLocalOverrides();
          setMemories(base);
          setFinal(mergeFinal(pub.final));
        } else {
          setMemories(applyMemoryOverrides(base, loadLocalMemoryOverrides()));
          setFinal(mergeFinal(pub.final, loadLocalFinalOverride()));
        }
      })
      .catch(() => { /* sense recuerdos.json es fa servir el codi */ })
      .then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (allDone && activeId === null) {
      playSound("star");
      confetti({
        particleCount: 260,
        spread: 140,
        origin: { y: 0.4 },
        colors: Object.values(EMOTIONS).map((e) => e.color),
      });
    }
  }, [allDone, activeId]);

  const active = memories.find((m) => m.id === activeId) || null;

  const goHome = () => {
    setActiveId(null);
    setShowProgress(true);
    window.history.replaceState({}, "", window.location.pathname);
    window.scrollTo({ top: 0 });
  };
  const openSphere = (id: number) => {
    playSound("tap");
    setActiveId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("bola", String(id));
    window.history.replaceState({}, "", url.toString());
    window.scrollTo({ top: 0 });
  };

  const unlock = (id: number, label?: string) =>
    setProgress((prev) => (prev[id] ? prev : { ...prev, [id]: { label: label || "", date: new Date().toLocaleString() } }));

  const byEmotion = useMemo(() => {
    const r = {} as Record<EmotionKey, number>;
    (Object.keys(EMOTIONS) as EmotionKey[]).forEach((k) => (r[k] = 0));
    memories.forEach((m) => { if (progress[m.id]) r[m.emotion]++; });
    return r;
  }, [memories, progress]);

  // Avís flotant del Minion: visible des de QUALSEVOL pantalla (inici o dins d'una esfera),
  // perquè si es van escanejant boles seguides mai es torna a l'inici.
  const minionOverlay = minionComment && (
    <div className="minion-toast" onClick={() => setMinionComment(null)}>
      <MinionImg size={56} anim="minion-salt" />
      <p>{minionComment}</p>
    </div>
  );

  /* ---------- AVANÇAMENT DE L'ANIVERSARI (no toca el progrés del joc) ---------- */
  if (teaserMode) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Fons />
        <Teaser />
      </div>
    );
  }

  /* ---------- CÀRREGA: evita el parpelleig del text per defecte ---------- */
  if (!ready && !editing) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Fons />
        <main className="tarjeta flex flex-col items-center py-14 text-center" style={active ? { borderColor: EMOTIONS[active.emotion].color } : undefined}>
          {active ? (
            <Sphere emotion={active.emotion} emotion2={active.emotion2} size={110} pulse />
          ) : (
            <div className="animate-floaty"><MinionImg size={110} /></div>
          )}
          <h1 className="titol mt-5">{active ? `Esfera ${pad(active.id)}` : APP_NAME}</h1>
          <p className="subtitulo">Obrint la càmera dels records…</p>
        </main>
      </div>
    );
  }

  /* ---------- PÀGINA D'UNA ESFERA ---------- */
  if (active && !editing) {
    const others = Object.keys(progress).filter((k) => Number(k) !== active.id).length;
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Fons />
        {minionOverlay}
        <MemoryExperience
          memory={active}
          unlocked={!!progress[active.id]}
          unlockedCount={unlockedCount}
          othersUnlocked={others}
          onUnlock={(l) => unlock(active.id, l)}
          onHome={goHome}
        />
        {printing && <PrintSheets memories={memories} onClose={() => setPrinting(false)} />}
      </div>
    );
  }

  /* ---------- PÀGINA D'INICI (ESTANTERIA DE MEMÒRIA + MINION) ---------- */
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Fons />
      {minionOverlay}

      <main className="tarjeta">
        {/* Capçalera amb control de so */}
        <div className="cabecera flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="mundo">{APP_NAME}</span>
            <button
              onClick={toggleSound}
              className="boto-so"
              title={soundActive ? "Silenciar" : "Activar so"}
            >
              {soundActive ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>{soundActive ? "So" : "Mut"}</span>
            </button>
          </div>
          <span className="mundo" style={{ color: "#9a8a70" }}>30 Records</span>
        </div>

        {/* Minion que saluda a la capçalera */}
        <div className="relative mx-auto my-1 flex justify-center">
          <MinionImg size={90} anim={allDone ? "minion-salt" : "minion-anim"} />
        </div>

        <h1 className="titol">{APP_NAME}</h1>
        <p className="subtitulo">
          {allDone
            ? "Has recuperat tots els records!"
            : unlockedCount === 0
            ? "Missatge urgent"
            : `${unlockedCount} de 30 records recuperats`}
        </p>

        {/* Missatge final en completar les 30 */}
        {allDone && (
          <div className="animate-pop-in my-3">
            <section className="pista" style={{ borderLeftColor: "#ffd23f" }}>
              <b className="text-lg">🌟 {final.title}</b>
              {"\n\n"}
              {final.message}
            </section>
            {final.photo && <img src={final.photo} alt="" className="foto-record mt-4" />}
          </div>
        )}

        {/* Explicació inicial: desapareix quan les 30 esferes ja estan recuperades */}
        {!allDone && <section className="pista">{final.homeText}</section>}

        <div className="final">
          {allDone ? "💛 Gràcies per recuperar-los tots." : "🔍 Busca la primera esfera per a començar l'aventura."}
        </div>

        {/* ESTANTERIA DE MEMÒRIA (esferes rodant a lloc) */}
        <div className="mt-6 border-t border-amber-900/10 pt-4">
          <button
            onClick={() => setShowProgress((v) => !v)}
            className="boto secundari flex items-center justify-center gap-2"
            style={{ marginTop: 0 }}
          >
            <Sparkles size={16} />
            <span>
              {showProgress ? "Amagar estanteria ▲" : `Estanteria de memòria (${unlockedCount}/30) ▼`}
            </span>
          </button>

          {showProgress && (
            <div className="animate-pop-in mt-4">
              {/* Barra de progrés per emocions */}
              <div className="barra-progres">
                <span style={{ width: `${(unlockedCount / 30) * 100}%` }} />
              </div>

              {/* Llegenda d'emocions */}
              <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
                {(Object.keys(EMOTIONS) as EmotionKey[]).map((k) => (
                  <span key={k} className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: EMOTIONS[k].color }} />
                    {EMOTIONS[k].name} {byEmotion[k]}
                  </span>
                ))}
              </div>

              {/* Les 30 esferes a la prestatgeria (amb animació de rodar a lloc) */}
              <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6">
                {memories.map((m) => {
                  const done = !!progress[m.id];
                  const special = m.kind !== "game";
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (done) openSphere(m.id);
                        else {
                          playSound("fail");
                          setToast(`🔒 Esfera ${pad(m.id)} encriptada. Acosta el mòbil a la bola física per desxifrar-la.`);
                          setTimeout(() => setToast(null), 2800);
                        }
                      }}
                      className={`flex flex-col items-center gap-1 rounded-xl p-1 transition-all active:scale-95 ${
                        done ? "esfera-roda" : ""
                      }`}
                      title={done ? m.title : "Encriptada"}
                    >
                      <Sphere
                        emotion={m.emotion}
                        emotion2={m.emotion2}
                        size={56}
                        locked={!done}
                        photo={done ? m.photo : undefined}
                        number={m.id}
                      />
                      <span className={`text-[10px] font-bold leading-tight ${done ? "text-stone-800" : "text-stone-400"}`}>
                        {done
                          ? special
                            ? m.kind === "intro"
                              ? "Inici"
                              : m.kind === "gift"
                              ? "🎁"
                              : "🎬"
                            : "✓"
                          : special && m.kind !== "intro"
                          ? "★"
                          : "?"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-[11px] font-semibold text-stone-500">
                Les esferes grises encara estan encriptades. Les ★ són especials.
              </p>
            </div>
          )}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-2xl bg-stone-900 px-4 py-3 text-center text-sm font-bold text-white shadow-2xl animate-pop-in">
          {toast}
        </div>
      )}

      {editing && (
        <Editor
          memories={memories}
          final={final}
          progress={progress}
          onChange={updateMemories}
          onChangeFinal={updateFinal}
          onResetProgress={() => { resetProgress(); setProgress({}); }}
          onUnlockAll={() => {
            const p: Progress = {};
            memories.forEach((m) => (p[m.id] = { label: "prova", date: new Date().toLocaleString() }));
            setProgress(p);
          }}
          onClose={() => { setEditing(false); window.history.replaceState({}, "", window.location.pathname); }}
          onPrint={() => setPrinting(true)}
        />
      )}
      {printing && <PrintSheets memories={memories} onClose={() => setPrinting(false)} />}
    </div>
  );
}
