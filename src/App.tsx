import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { APP_NAME, CONTENT_VERSION, DEFAULT_MEMORIES, EMOTIONS, EmotionKey, FINAL_DEFAULT, Memory } from "./data/memories";
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
import { Volume2, VolumeX } from "lucide-react";

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

  // Inicialització sincrònica: sap quina bola o mode obrir des del primer mil·lisegon
  const [activeId, setActiveId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const b = parseInt(new URLSearchParams(window.location.search).get("bola") || "");
    return b >= 1 && b <= 30 ? b : null;
  });
  const [editing, setEditing] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("editar") === "1";
  });

  const [ready, setReady] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [minionComment, setMinionComment] = useState<string | null>(null);

  // Avançament del dia de l'aniversari (?sorpresa=1): pàgina independent del joc
  const [teaserMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("sorpresa") === "1";
  });

  const { on: soundActive, toggle: toggleSound } = useSound();

  const unlockedCount = Object.keys(progress).length;
  const allDone = unlockedCount >= 30;

  useEffect(() => saveProgress(progress), [progress]);

  const updateMemories = (list: Memory[]) => { setMemories(list); saveMemories(list); };
  const updateFinal = (f: typeof FINAL_DEFAULT) => { setFinal(f); saveFinal(f); };

  // Frases del Minion cada 5 esferes
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

  // Gestió de reset
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("reset") === "1") {
      resetProgress();
      setProgress({});
      window.history.replaceState({}, "", window.location.pathname);
      setToast("🔄 Progrés reiniciat. Totes les esferes tornen a estar encriptades.");
      setTimeout(() => setToast(null), 4000);
    }
  }, []);

  // 🔄 AUTO-ACTUALITZACIÓ (restaurada): els mòbils guarden l'index.html a la memòria cau i
  // es poden quedar amb una versió antiga del joc. Es demana la versió fresca al servidor
  // (?check= per saltar-se la cau); si ha canviat des de l'última visita, es recarrega UNA
  // sola vegada amb una URL única perquè el navegador baixi el codi nou.
  useEffect(() => {
    const KEY_SIG = "app_html_sig";
    fetch(`${window.location.pathname}?check=${Date.now()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : null))
      .then((html) => {
        if (!html) return;
        let h = 5381;
        for (let i = 0; i < html.length; i++) h = ((h << 5) + h + html.charCodeAt(i)) | 0;
        const sig = `${html.length}-${(h >>> 0).toString(36)}`;
        let old: string | null = null;
        try {
          old = localStorage.getItem(KEY_SIG);
          localStorage.setItem(KEY_SIG, sig);
        } catch { /* sense localStorage no es pot comparar */ }
        if (old && old !== sig) {
          const url = new URL(window.location.href);
          url.searchParams.set("actualitzacio", sig.slice(-6));
          window.location.replace(url.toString());
        }
      })
      .catch(() => { /* sense connexió: es continua amb la versió actual */ });
  }, []);

  // Càrrega suau de les dades publicades
  useEffect(() => {
    cleanupOldContentKeys();
    loadPublished()
      .then((pub) => {
        if (!pub) {
          setReady(true);
          return;
        }
        // Snapshot complet: records.json és autoritari i NO es barreja amb memories.ts.
        // JSON antic parcial: només es fa la barreja temporal per poder migrar-lo des de l'editor.
        const isFull = pub.mode === "full" && pub.memories.length === 30;
        const base: Memory[] = isFull
          ? pub.memories.map((raw) => {
              const m = raw as Memory & { emotion2?: EmotionKey | null };
              return { ...m, emotion2: m.emotion2 || undefined, config: m.config || {} };
            })
          : applyMemoryOverrides(DEFAULT_MEMORIES, pub.memories);
        const localIsStale = hasLocalOverrides() && getLocalBaseSig() !== pub.sig;
        if (localIsStale) {
          clearLocalOverrides();
          setMemories(base);
          setFinal(isFull ? (pub.final as typeof FINAL_DEFAULT) : mergeFinal(pub.final));
        } else {
          // Al joc públic mana sempre records.json. Els canvis locals només es veuen al panell
          // mentre s'estan editant i abans de tornar a exportar.
          setMemories(editing ? applyMemoryOverrides(base, loadLocalMemoryOverrides()) : base);
          setFinal(
            editing
              ? mergeFinal(isFull ? (pub.final as typeof FINAL_DEFAULT) : pub.final, loadLocalFinalOverride())
              : isFull
              ? (pub.final as typeof FINAL_DEFAULT)
              : mergeFinal(pub.final)
          );
        }
        setReady(true);
      })
      .catch(() => {
        // En cas d'error de xarxa, es dóna pas a les memòries per defecte del codi
        setReady(true);
      });
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

  // Avís flotant del Minion
  const minionOverlay = minionComment && (
    <div className="minion-toast" onClick={() => setMinionComment(null)}>
      <MinionImg size={56} anim="minion-salt" />
      <p>{minionComment}</p>
    </div>
  );

  /* ---------- CÀRREGA NEUTRA ABANS DE QUALSEVOL CONTINGUT ----------
   * No es renderitza cap títol, color, esfera, calendari ni editor fins haver rebut
   * records.json. Això elimina definitivament el micro-parpelleig de dades antigues. */
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Fons />
        <main className="tarjeta flex flex-col items-center py-14 text-center">
          <div className="h-24 w-24 animate-pulse rounded-full bg-gradient-to-br from-stone-200 to-stone-400 shadow-inner" />
          <h1 className="titol mt-5">La Càmera dels Records</h1>
          <p className="subtitulo">Carregant…</p>
        </main>
      </div>
    );
  }

  /* ---------- AVANÇAMENT DE L'ANIVERSARI (?sorpresa=1) ---------- */
  if (teaserMode) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Fons />
        <Teaser daysData={final.teaserDays} />
      </div>
    );
  }

  /* ---------- PÀGINA D'UNA ESFERA CONCRETA (?bola=1...30) ---------- */
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

  /* ---------- PÀGINA D'INICI: LA BÓVEDA AMB LES 30 ESFERES SEMPRE VISIBLES ---------- */
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

        {/* ESTANTERIA DE MEMÒRIA AMB LES 30 ESFERES (SEMPRE VISIBLES) */}
        <div className="mt-6 border-t border-amber-900/10 pt-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Estanteria de memòria</span>
            <span className="text-xs font-bold text-amber-700">{unlockedCount} / 30</span>
          </div>

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

          {/* Les 30 esferes a la prestatgeria (sempre visibles) */}
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
          {/* Número de versió discret: serveix per comprovar si un mòbil té el codi nou */}
          <p className="mt-2 text-right text-[9px] font-semibold text-stone-300">v{CONTENT_VERSION}</p>
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
